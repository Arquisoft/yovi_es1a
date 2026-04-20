//! HTTP server for Y game bots.
//!
//! This module provides an Axum-based REST API for querying Y game bots.
//! The server exposes endpoints for checking bot status and requesting moves.
//!
//! # Endpoints
//! - `GET /status` - Health check endpoint
//! - `POST /{api_version}/ybot/choose/{bot_id}` - Request a move from a bot
//!
//! # Example
//! ```no_run
//! use gamey::run_bot_server;
//! 
//!
//! #[tokio::main]
//! async fn main() {
//!     if let Err(e) = run_bot_server(3000).await {
//!         eprintln!("Server error: {}", e);
//!     }
//! }
//! ```
use axum::Json;
use crate::{GameY, YEN, GameStatus}; 
pub mod choose;
pub mod error;
pub mod state;
pub mod version;
use axum::response::IntoResponse; // Required to manage API responses.
use tower_http::cors::CorsLayer;
use std::sync::Arc;
pub use choose::MoveResponse;
pub use error::ErrorResponse;
pub use version::*;

use crate::{GameYError, GroupExpansionBot, MonteCarloBot, PriorityBlockBot, RandomBot, ShortestPathBot, SimpleBlockerBot, TriangleAttackBot, YBotRegistry, state::AppState};



use prometheus::{Encoder, TextEncoder};

async fn metrics() -> String {
    let encoder = TextEncoder::new();//Transforma métricas a texto legible
    let metric_families = prometheus::gather();//Devuelve todas las métricas

    let mut buffer = Vec::new();//Escribe las métricas
    encoder.encode(&metric_families, &mut buffer).unwrap();//Codifica las métricas para prometheus

    String::from_utf8(buffer).unwrap()//Convierte a string
}



/// Creates the Axum router with the given state.
///
/// This is useful for testing the API without binding to a network port.
pub fn create_router(state: AppState) -> axum::Router {
    axum::Router::new()
        .route("/status", axum::routing::get(status))
        .route("/metrics", axum::routing::get(metrics))
        .route("/play", axum::routing::get(choose::play_competition))
        .route(
            "/{api_version}/ybot/choose/{bot_id}",
            axum::routing::post(choose::choose),
        ).route("/{api_version}/game/check_winner", axum::routing::post(check_winner))
        .with_state(state)
}

/// Creates the default application state with the standard bot registry.
///
/// The default state includes the `RandomBot` which selects moves randomly.
pub fn create_default_state() -> AppState {
    let bots = YBotRegistry::new()
        .with_bot(Arc::new(RandomBot))
        .with_bot(Arc::new(ShortestPathBot))
        .with_bot(Arc::new(MonteCarloBot))
        .with_bot(Arc::new(GroupExpansionBot))
        .with_bot(Arc::new(PriorityBlockBot))
        .with_bot(Arc::new(SimpleBlockerBot))
        .with_bot(Arc::new(TriangleAttackBot));
    
    AppState::new(bots)
}

/// Starts the bot server on the specified port.
///
/// This function blocks until the server is shut down.
///
/// # Arguments
/// * `port` - The TCP port to listen on
///
/// # Errors
/// Returns `GameYError::ServerError` if:
/// - The TCP port cannot be bound (e.g., port already in use, permission denied)
/// - The server encounters an error while running
pub async fn run_bot_server(port: u16) -> Result<(), GameYError> {
    let state = create_default_state();
    //let app = create_router(state);
    let app = create_router(state).layer(CorsLayer::permissive()); // Enable CORS so that the Frontend (React) can connect to this port without being blocked.

    let addr = format!("0.0.0.0:{}", port);
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .map_err(|e| GameYError::ServerError {
            message: format!("Failed to bind to {}: {}", addr, e),
        })?;

    println!("Server mode: Listening on http://{}", addr);
    axum::serve(listener, app)
        .await
        .map_err(|e| GameYError::ServerError {
            message: format!("Server error: {}", e),
        })?;

    Ok(())
}
pub async fn check_winner(Json(payload): Json<YEN>) -> impl IntoResponse {
    match GameY::try_from(payload) {
        Ok(game) => {
            match game.status() {
                GameStatus::Finished { .. } => {
                    Json(serde_json::json!({ "status": "win" }))
                },
                GameStatus::Ongoing { .. } => {
                    Json(serde_json::json!({ "status": "ongoing" }))
                },
            }
        },
        Err(_) => Json(serde_json::json!({ "status": "error", "message": "Layout inválido" })),
    }
}

/// Health check endpoint handler.
///
/// Returns "OK" to indicate the server is running.
pub async fn status() -> impl IntoResponse {
    "OK"
}
