//! Implementation of a hard-level bot
//!
//! This module contains the structure [`MonteCarloBot`]. This opponent attempts to 
//! play with a strategic and probabilistic logic: it uses a Flat Monte Carlo 
//! algorithm to simulate hundreds of random futures and picks the one with the 
//! highest win rate.

use crate::{Coordinates, GameStatus,GameY, Movement, YBot};
use rand::prelude::IndexedRandom;
use rand::seq::SliceRandom;

/// A bot that chooses moves following a Flat Monte Carlo strategy
///
/// To decide where to place its next piece, this bot follows this reasoning:
/// 1. It identifies all available (empty) cells on the board.
/// 2. For each empty cell, it clones the current board state and places its piece there.
/// 3. From that point, it simulates a fixed number of games (e.g., 100) by filling the 
///    rest of the board with completely random moves for both players.
/// 4. It records how many of those random simulations result in a victory for the bot.
/// 5. It selects the cell with the highest number of simulated victories.
/// 6. If multiple cells share the highest score, it randomly chooses one among the best.
///
/// This statistical approach allows the bot to naturally discover complex blocking 
/// and connection strategies without having them explicitly programmed.
/// 
/// # Example
///
/// ```
/// use gamey::{GameY, MonteCarloBot, YBot};
///
/// let bot = MonteCarloBot;
/// let game = GameY::new(5);
///
/// // The bot will always return Some when there are available moves
/// let chosen_move = bot.choose_move(&game);
/// assert!(chosen_move.is_some());
/// ```
pub struct MonteCarloBot;

impl YBot for MonteCarloBot {
    fn name(&self) -> &str {
        "monte_carlo_bot"   
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        let available_cells = board.available_cells();
        if available_cells.is_empty() {
            return None;
        }

        let bot_id = board.next_player()?;
        let mut best_score = -1;
        let mut best_cells = Vec::new();
        
        let simulations = 100;

        for &cell in available_cells {
            let coords = Coordinates::from_index(cell, board.board_size());
            let mut wins = 0;

            for _ in 0..simulations {
                let mut simulated_board = board.clone();
                
                let _ = simulated_board.add_move(Movement::Placement {
                    player: bot_id,
                    coords,
                });

                let mut remaining_cells = simulated_board.available_cells().clone();
                remaining_cells.shuffle(&mut rand::rng());

                for random_cell in remaining_cells {
                    if simulated_board.check_game_over() {
                        break; 
                    }

                    if let Some(current_player) = simulated_board.next_player() {
                        let random_coords = Coordinates::from_index(random_cell, simulated_board.board_size());
                        let _ = simulated_board.add_move(Movement::Placement {
                            player: current_player,
                            coords: random_coords,
                        });
                    }
                }

                if let GameStatus::Finished { winner } = simulated_board.status() {
                    if *winner == bot_id {
                        wins += 1;
                    }
                }
            }

            if best_score < wins {
                best_score = wins;
                best_cells.clear();
                best_cells.push(coords);
            } else if best_score == wins {
                best_cells.push(coords);
            }
        }

        let chosen_coords = best_cells.choose(&mut rand::rng())?;
        Some(*chosen_coords)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{Movement, PlayerId};

    #[test]
    fn test_monte_carlo_bot_name() {
        let bot = MonteCarloBot;
        assert_eq!(bot.name(), "monte_carlo_bot");
    }

    #[test]
    fn test_monte_carlo_bot_returns_move_on_empty_board() {
        let bot = MonteCarloBot;
        let game = GameY::new(5);

        let chosen_move = bot.choose_move(&game);
        assert!(chosen_move.is_some());
    }

    #[test]
    fn test_monte_carlo_bot_returns_valid_coordinates() {
        let bot = MonteCarloBot;
        let game = GameY::new(5);

        let coords = bot.choose_move(&game).unwrap();
        let index = coords.to_index(game.board_size());

        // Index should be within the valid range for a size-5 board
        // Total cells = (5 * 6) / 2 = 15
        assert!(index < 15);
    }

    #[test]
    fn test_monte_carlo_bot_returns_none_on_full_board() {
        let bot = MonteCarloBot;
        let mut game = GameY::new(2);

        // Fill the board (size 2 has 3 cells)
        let moves = vec![
            Movement::Placement {
                player: PlayerId::new(0),
                coords: Coordinates::new(1, 0, 0),
            },
            Movement::Placement {
                player: PlayerId::new(1),
                coords: Coordinates::new(0, 1, 0),
            },
            Movement::Placement {
                player: PlayerId::new(0),
                coords: Coordinates::new(0, 0, 1),
            },
        ];

        for mv in moves {
            game.add_move(mv).unwrap();
        }

        // Board is now full
        assert!(game.available_cells().is_empty());
        let chosen_move = bot.choose_move(&game);
        assert!(chosen_move.is_none());
    }

    #[test]
    fn test_monte_carlo_bot_chooses_from_available_cells() {
        let bot = MonteCarloBot;
        let mut game = GameY::new(3);

        // Make some moves to reduce available cells
        game.add_move(Movement::Placement {
            player: PlayerId::new(0),
            coords: Coordinates::new(2, 0, 0),
        })
        .unwrap();

        let coords = bot.choose_move(&game).unwrap();
        let index = coords.to_index(game.board_size());

        // The chosen index should be in the available cells
        assert!(game.available_cells().contains(&index));
    }

    #[test]
    fn test_monte_carlo_bot_multiple_calls_return_valid_moves() {
        let bot = MonteCarloBot;
        let game = GameY::new(7);

        // Call choose_move multiple times to exercise the randomness
        for _ in 0..10 {
            let coords = bot.choose_move(&game).unwrap();
            let index = coords.to_index(game.board_size());

            // Total cells for size 7 = (7 * 8) / 2 = 28
            assert!(index < 28);
            assert!(game.available_cells().contains(&index));
        }
    }
}
