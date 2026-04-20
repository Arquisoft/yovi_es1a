use crate::{Coordinates, GameY, YEN, check_api_version, error::ErrorResponse, state::AppState};
use axum::{
    Json,
    extract::{Path, State},
};
use serde::{Deserialize, Serialize};


use crate::metrics::{GAMES_PLAYED, RESPONSE_TIME};
use std::time::Instant;




/// Path parameters extracted from the choose endpoint URL.
#[derive(Deserialize)]
pub struct ChooseParams {
    /// The API version (e.g., "v1").
    api_version: String,
    /// The identifier of the bot to use for move selection.
    bot_id: String,
}

/// Response returned by the choose endpoint on success.
///
/// Contains the bot's chosen move coordinates along with context
/// about which API version and bot were used.
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub struct MoveResponse {
    /// The API version used for this request.
    pub api_version: String,
    /// The bot that selected this move.
    pub bot_id: String,
    /// The coordinates where the bot chooses to place its piece.
    pub coords: Coordinates,
    // State of the game ("ongoing","bot_won"..)
    pub game_status:String,
}

/// Handler for the bot move selection endpoint.
///
/// This endpoint accepts a game state in YEN format and returns the
/// coordinates of the bot's chosen move.
///
/// # Route
/// `POST /{api_version}/ybot/choose/{bot_id}`
///
/// # Request Body
/// A JSON object in YEN format representing the current game state.
///
/// # Response
/// On success, returns a `MoveResponse` with the chosen coordinates.
/// On failure, returns an `ErrorResponse` with details about what went wrong.
#[axum::debug_handler]
pub async fn choose(
    State(state): State<AppState>,
    Path(params): Path<ChooseParams>,
    Json(yen): Json<YEN>,
) -> Result<Json<MoveResponse>, Json<ErrorResponse>> {
    let start = Instant::now();
    check_api_version(&params.api_version)?;
    let game_y = match GameY::try_from(yen) {
        Ok(game) => game,
        Err(err) => {
            return Err(Json(ErrorResponse::error(
                &format!("Invalid YEN format: {}", err),
                Some(params.api_version),
                Some(params.bot_id),
            )));
        }
    };
    if let crate::GameStatus::Finished { winner } = game_y.status() {
        let status_str = if *winner == crate::PlayerId::new(0) { "human_won" } else { "bot_won" };
        return Ok(Json(MoveResponse {
            api_version: params.api_version,
            bot_id: params.bot_id,
            coords: crate::Coordinates::new(0, 0, 0),
            game_status: status_str.to_string(),
        }));
    }
    let bot = match state.bots().find(&params.bot_id) {
        Some(bot) => bot,
        None => {
            let available_bots = state.bots().names().join(", ");
            return Err(Json(ErrorResponse::error(
                &format!(
                    "Bot not found: {}, available bots: [{}]",
                    params.bot_id, available_bots
                ),
                Some(params.api_version),
                Some(params.bot_id),
            )));
        }
    };
    let coords = match bot.choose_move(&game_y) {
        Some(coords) => coords,
        None => {
            // Handle the case where the bot has no valid moves
            return Err(Json(ErrorResponse::error(
                "No valid moves available for the bot",
                Some(params.api_version),
                Some(params.bot_id),
            )));
        }
    };
    let mut game_y_mut = game_y;
    let bot_player_id = crate::PlayerId::new(1); //asume bot plays always as player 1
    let bot_move = crate::Movement::Placement {
        player: bot_player_id,
        coords: coords,
    };
    if let Err(e) = game_y_mut.add_move(bot_move) {
        return Err(Json(ErrorResponse::error(
            &format!("Failed to apply bot move to calculate state: {:?}", e),
            Some(params.api_version),
            Some(params.bot_id),
        )));
    }
    let status_str = match game_y_mut.status() {
        crate::GameStatus::Ongoing { .. } => "ongoing".to_string(),
        crate::GameStatus::Finished { winner } => {
            if *winner == bot_player_id {
                "bot_won".to_string()
            } else {
                "human_won".to_string()
            }
        }
    };
    let response = MoveResponse {
        api_version: params.api_version,
        bot_id: params.bot_id.clone(),
        coords,
        game_status: status_str,
    };
    let duration = start.elapsed();

    // Para Prometheus
    GAMES_PLAYED
        .with_label_values(&[&params.bot_id.clone()])
        .inc();

    RESPONSE_TIME.observe(duration.as_secs_f64());
    
    Ok(Json(response))
}

use axum::extract::Query;
use serde_json::Value;

/// Estructura que define qué parámetros esperamos recibir en la URL (Query String).
/// Ejemplo de URL esperada: /play?position={"size":3...}&bot_id=monte_carlo_bot
#[derive(Deserialize)]
pub struct CompetitionParams {
    /// Estado del tablero estructurado en formato YEN (llega como texto/string)
    position: String,
    /// Identificador opcional del bot. Si no se envía, usaremos uno por defecto.
    bot_id: Option<String>,
}

/// GET /play (Exclusivo para la competición)
/// Handler de Axum que recibe el estado de la aplicación y los parámetros de la URL.
#[axum::debug_handler]
pub async fn play_competition(
    State(state): State<AppState>, // Acceso a los bots guardados en la memoria del servidor
    Query(params): Query<CompetitionParams>, // Extrae los parámetros ?position=... y ?bot_id=...
) -> Result<Json<Value>, Json<ErrorResponse>> {
    
    // 1. Determinar el bot:
    // Si la peticion contiene un bot_id, usamos ese. Si contiene la variable vacía (None), 
    // usamos "random_bot" como estrategia de seguridad.
    let bot_name = params.bot_id.unwrap_or_else(|| "random_bot".to_string());

    // 2. Deserializar el tablero (De texto a objeto YEN):
    // Intentamos convertir el texto JSON de la URL en nuestra estructura interna YEN.
    let yen: YEN = match serde_json::from_str(&params.position) {
        Ok(y) => y, // Si el JSON está bien formado, lo guardamos en 'yen'
        Err(e) => return Err(Json(ErrorResponse::error(
            // Si la peticion contiene un JSON roto, devolvemos un error HTTP detallado
            &format!("JSON inválido en position: {}", e),
            Some("v1".to_string()),
            Some(bot_name),
        ))),
    };

    // 3. Convertir al estado del juego (De YEN a GameY):
    // Traducimos el formato YEN a la estructura lógica 'GameY' que entiende la IA.
    let game_y = match GameY::try_from(yen) {
        Ok(game) => game, // Si el tablero es lógicamente válido, lo guardamos en 'game_y'
        Err(err) => return Err(Json(ErrorResponse::error(
            // Si el tablero tiene reglas rotas (ej. tamaño negativo), devolvemos error
            &format!("Formato YEN inválido: {}", err),
            Some("v1".to_string()),
            Some(bot_name),
        ))),
    };
    // 4. Escoger la IA:
    // Buscamos en el registro de nuestro servidor (state) el bot que nos han pedido.
    let bot = match state.bots().find(&bot_name) {
        Some(bot) => bot, // Bot encontrado, listo para jugar
        None => return Err(Json(ErrorResponse::error(
            &format!("Bot no encontrado: {}", bot_name),
            Some("v1".to_string()),
            Some(bot_name.clone()),
        ))),
    };

    // 5.Calculo y toma de decision:
    // Le pasamos el tablero válido a la IA y le pedimos que calcule su siguiente movimiento.
    let coords = match bot.choose_move(&game_y) {
        Some(coords) => coords,
        None => {
            // Si el bot se ha quedado sin movimientos válidos resigna
            return Ok(Json(serde_json::json!({
                "action": "resign"
            })));
        }
    };

    // 6. Respuesta normal:
    // Si llegamos hasta aquí, es porque la IA tiene un movimiento.
    // Construimos el JSON exacto con la clave "coords".
    Ok(Json(serde_json::json!({
        "coords": coords
    })))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_move_response_creation() {
        let response = MoveResponse {
            api_version: "v1".to_string(),
            bot_id: "random".to_string(),
            coords: Coordinates::new(1, 2, 3),
            game_status: "ongoing".to_string(),
        };
        assert_eq!(response.api_version, "v1");
        assert_eq!(response.bot_id, "random");
        assert_eq!(response.coords, Coordinates::new(1, 2, 3));
        assert_eq!(response.game_status, "ongoing");
    }

    #[test]
    fn test_move_response_serialize() {
        let response = MoveResponse {
            api_version: "v1".to_string(),
            bot_id: "random".to_string(),
            coords: Coordinates::new(1, 2, 3),
            game_status: "ongoing".to_string(),
        };
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"api_version\":\"v1\""));
        assert!(json.contains("\"bot_id\":\"random\""));
        assert!(json.contains("\"game_status\":\"ongoing\""));
    }

    #[test]
    fn test_move_response_deserialize() {
        let json = r#"{"api_version":"v1","bot_id":"test","coords":{"x":0,"y":1,"z":2},"game_status":"ongoing"}"#;
        let response: MoveResponse = serde_json::from_str(json).unwrap();
        assert_eq!(response.api_version, "v1");
        assert_eq!(response.bot_id, "test");
        assert_eq!(response.game_status, "ongoing");
    }

    #[test]
    fn test_move_response_clone() {
        let response = MoveResponse {
            api_version: "v1".to_string(),
            bot_id: "random".to_string(),
            coords: Coordinates::new(0, 0, 0),
            game_status: "bot_won".to_string(),
        };
        let cloned = response.clone();
        assert_eq!(response, cloned);
    }

    #[test]
    fn test_move_response_equality() {
        let r1 = MoveResponse {
            api_version: "v1".to_string(),
            bot_id: "random".to_string(),
            coords: Coordinates::new(1, 1, 1),
            game_status: "ongoing".to_string(),
        };
        let r2 = MoveResponse {
            api_version: "v1".to_string(),
            bot_id: "random".to_string(),
            coords: Coordinates::new(1, 1, 1),
            game_status: "ongoing".to_string(),
        };
        let r3 = MoveResponse {
            api_version: "v2".to_string(),
            bot_id: "random".to_string(),
            coords: Coordinates::new(1, 1, 1),
            game_status: "ongoing".to_string(),
        };
        assert_eq!(r1, r2);
        assert_ne!(r1, r3);
    }
}
