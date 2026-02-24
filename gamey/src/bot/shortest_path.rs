//! Implementation of a hard-level bot
//!
//! This module contains the structure [`ShortestPathBot`]. This opponent attempts to 
//! play with a strategic and mathematical logic: it evaluates the connectivity 
//! of the board to find the shortest path to connect all three sides of the triangle,
//! while simultaneously blocking the opponent's most dangerous paths.

use crate::{Coordinates, GameY, YBot, PlayerId, Movement};
use rand::prelude::IndexedRandom;
use std::collections::VecDeque;

/// A bot that chooses moves following a Shortest Path and Connectivity strategy
///
/// To decide where to place its next piece, this bot follows this reasoning:
/// 1. It identifies all available (empty) cells on the board.
/// 2. For each cell, it calculates a score based on how many edges (A, B, C) 
///    it can connect or help to connect.
/// 3. It analyzes neighboring groups to detect "bridge" opportunities that 
///    unite previously separated sides of the board.
/// 4. It performs the same analysis for the opponent, assigning a high priority 
///    to blocking moves that prevent the rival from completing their triangle.
/// 5. It selects the cell with the highest combined score (Attack + Defense).
///
/// This deterministic approach allows the bot to play perfectly in terms of 
/// connectivity, making it a very difficult opponent to beat.
pub struct ShortestPathBot;

impl YBot for ShortestPathBot {
    fn name(&self) -> &str {
        "shortest_path_bot"
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        let available_cells = board.available_cells();
        if available_cells.is_empty() { return None; }

        let me = board.next_player()?;
        let rival = if me.id() == 0 { PlayerId::new(1) } else { PlayerId::new(0) };

        // Distancias iniciales usando números naturales (usize)
        let mi_distancia_antes = calcular_distancia_total(board, me);
        let rival_distancia_antes = calcular_distancia_total(board, rival);

        let mut mejor_puntuacion: i64 = -999999; 
        let mut mejores_casillas = Vec::new();

        for &indice in available_cells {
            let coords = Coordinates::from_index(indice, board.board_size());

            let mut tablero_simulado = board.clone();
            let _ = tablero_simulado.add_move(Movement::Placement { player: me, coords });

            let mi_distancia_despues = calcular_distancia_total(&tablero_simulado, me);
            // Si la distancia baja, la mejora es positiva
            let mi_mejora = (mi_distancia_antes as i64) - (mi_distancia_despues as i64);

            let rival_distancia_despues = calcular_distancia_total(&tablero_simulado, rival);
            // Si su distancia sube, el perjuicio pal rival es positivo
            let rival_perjuicio = (rival_distancia_despues as i64) - (rival_distancia_antes as i64);

            let puntuacion_total = (mi_mejora * 10) + (rival_perjuicio * 15);

            if puntuacion_total > mejor_puntuacion {
                mejor_puntuacion = puntuacion_total;
                mejores_casillas.clear();
                mejores_casillas.push(coords);
            } else if puntuacion_total == mejor_puntuacion {
                mejores_casillas.push(coords);
            }
        }

        mejores_casillas.choose(&mut rand::rng()).copied()
    }
}

fn calcular_distancia_total(board: &GameY, jugador: PlayerId) -> usize {
    let size = board.board_size();
    
    let dist_a = distancias_desde_borde(board, jugador, "A");
    let dist_b = distancias_desde_borde(board, jugador, "B");
    let dist_c = distancias_desde_borde(board, jugador, "C");

    let mut distancia_minima = 999;

    for x in 0..size {
        for y in 0..(size - x) {
            let z = size - 1 - x - y;
            let c = Coordinates::new(x, y, z);
            let idx = c.to_index(size) as usize;

            let d1 = dist_a[idx];
            let d2 = dist_b[idx];
            let d3 = dist_c[idx];

            if d1 < 500 && d2 < 500 && d3 < 500 {
                let mut suma = d1 + d2 + d3;
                
                if board.player_at(&c) == Some(jugador) || board.player_at(&c).is_none() {
                    if suma >= 2 { suma -= 2; } else { suma = 0; }
                }

                if suma < distancia_minima {
                    distancia_minima = suma;
                }
            }
        }
    }
    distancia_minima
}

fn distancias_desde_borde(board: &GameY, jugador: PlayerId, lado: &str) -> Vec<usize> {
    let size = board.board_size();
    let total_celdas = (size * (size + 1)) / 2;
    let mut distancias = vec![999; total_celdas as usize];
    let mut cola = VecDeque::new();
    
    let rival = if jugador.id() == 0 { PlayerId::new(1) } else { PlayerId::new(0) };

    for x in 0..size {
        for y in 0..(size - x) {
            let z = size - 1 - x - y;
            let c = Coordinates::new(x, y, z);
            
            let toca = match lado {
                "A" => c.touches_side_a(),
                "B" => c.touches_side_b(),
                "C" => c.touches_side_c(),
                _ => false,
            };

            if toca && board.player_at(&c) != Some(rival) {
                let coste = if board.player_at(&c) == Some(jugador) { 0 } else { 1 };
                let idx = c.to_index(size) as usize;
                distancias[idx] = coste;
                cola.push_back(c);
            }
        }
    }

    while let Some(actual) = cola.pop_front() {
        let idx_actual = actual.to_index(size) as usize;
        let d_actual = distancias[idx_actual];

        for vecino in board.get_neighbors(&actual) {
            if board.player_at(&vecino) == Some(rival) { continue; }

            let coste_paso = if board.player_at(&vecino) == Some(jugador) { 0 } else { 1 };
            let nueva_dist = d_actual + coste_paso;
            let idx_v = vecino.to_index(size) as usize;

            if nueva_dist < distancias[idx_v] {
                distancias[idx_v] = nueva_dist;
                cola.push_back(vecino);
            }
        }
    }
    distancias
}


#[cfg(test)]
mod tests {
    use super::*;
    use crate::{Movement, PlayerId};

    #[test]
    fn test_shortest_path_bot_name() {
        let bot = ShortestPathBot;
        assert_eq!(bot.name(), "shortest_path_bot");
    }

    #[test]
    fn test_shortest_path_bot_returns_move_on_empty_board() {
        let bot = ShortestPathBot;
        let game = GameY::new(5);

        let chosen_move = bot.choose_move(&game);
        assert!(chosen_move.is_some());
    }

    #[test]
    fn test_shortest_path_bot_returns_valid_coordinates() {
        let bot = ShortestPathBot;
        let game = GameY::new(5);

        let coords = bot.choose_move(&game).unwrap();
        let index = coords.to_index(game.board_size());

        // El índice debe estar dentro del rango para un tablero de tamaño 5 (15 celdas)
        assert!(index < 15);
    }

    #[test]
    fn test_shortest_path_bot_returns_none_on_full_board() {
        let bot = ShortestPathBot;
        let mut game = GameY::new(2);

        // Llenamos el tablero (tamaño 2 tiene 3 celdas)
        let moves = vec![
            Movement::Placement { player: PlayerId::new(0), coords: Coordinates::new(1, 0, 0) },
            Movement::Placement { player: PlayerId::new(1), coords: Coordinates::new(0, 1, 0) },
            Movement::Placement { player: PlayerId::new(0), coords: Coordinates::new(0, 0, 1) },
        ];

        for mv in moves {
            game.add_move(mv).unwrap();
        }

        assert!(game.available_cells().is_empty());
        assert!(bot.choose_move(&game).is_none());
    }

    #[test]
    fn test_shortest_path_bot_chooses_from_available_cells() {
        let bot = ShortestPathBot;
        let mut game = GameY::new(3);

        game.add_move(Movement::Placement {
            player: PlayerId::new(0),
            coords: Coordinates::new(2, 0, 0),
        }).unwrap();

        let coords = bot.choose_move(&game).unwrap();
        let index = coords.to_index(game.board_size());

        assert!(game.available_cells().contains(&index));
    }

    #[test]
    fn test_shortest_path_bot_multiple_calls_return_valid_moves() {
        let bot = ShortestPathBot;
        let game = GameY::new(7);

        for _ in 0..10 {
            let coords = bot.choose_move(&game).unwrap();
            let index = coords.to_index(game.board_size());
            assert!(index < 28); // Tamaño 7 = 28 celdas
            assert!(game.available_cells().contains(&index));
        }
    }
}