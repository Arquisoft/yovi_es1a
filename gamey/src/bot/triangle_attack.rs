//! An offensive strategic bot implementation.
//!
//! This module provides [`TriangleAttackBot`], a bot that focuses on 
//! connectivity. It prioritizes joining its own pieces to form a network.

use crate::{Coordinates, GameY, YBot, PlayerId};
use rand::prelude::IndexedRandom;

/// A bot that chooses moves to maximize its own network connectivity.
///
/// This bot scans for "junctions"—empty cells that are neighbors to two
/// or more of its own pieces. If no junctions are found, it expands
/// from its existing pieces.
///
/// # Example
///
/// ```
/// use gamey::{GameY, TriangleAttackBot, YBot};
///
/// let bot = TriangleAttackBot;
/// let game = GameY::new(5);
///
/// // The bot will always return Some when there are available moves
/// let chosen_move = bot.choose_move(&game);
/// assert!(chosen_move.is_some());
/// ```
pub struct TriangleAttackBot;

impl YBot for TriangleAttackBot {
    fn name(&self) -> &str {
        "triangle_attack_bot"
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        let available_cells = board.available_cells();
        if available_cells.is_empty() {
            return None;
        }

        let actual_player = board.next_player()?;
        let board_size = board.board_size();

        let mut pivots = Vec::new();

        for &cell_index in available_cells {
            let coords = Coordinates::from_index(cell_index, board_size);
            
            let my_neighbors_count = count_my_neighbors(board, &coords, actual_player);

            if my_neighbors_count >= 2 {
                pivots.push(cell_index);
            }
        }

        // 2. Select move
        let chosen_index = if !pivots.is_empty() {
            pivots.choose(&mut rand::rng()).copied()?
        } else {
            let my_cells = board.cells_for_player(actual_player);
            let mut expansion_moves = Vec::new();

            for cell in my_cells {
                let neighbors = board.get_neighbors(&cell);
                for n in neighbors {
                    let n_idx = n.to_index(board_size);
                    if available_cells.contains(&n_idx) {
                        expansion_moves.push(n_idx);
                    }
                }
            }

            if !expansion_moves.is_empty() {
                expansion_moves.choose(&mut rand::rng()).copied()?
            } else {
                available_cells.choose(&mut rand::rng()).copied()?
            }
        };

        Some(Coordinates::from_index(chosen_index, board_size))
    }
}


fn count_my_neighbors(board: &GameY, coords: &Coordinates, my_id: PlayerId) -> usize {
    let mut count = 0;
    let neighbors = board.get_neighbors(coords);

    for neighbor in neighbors {
        if board.player_at(&neighbor) == Some(my_id) {
            count += 1;
        }
    }
    count
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{Movement, PlayerId};

    #[test]
    fn test_triangle_attack_bot_name() {
        let bot = TriangleAttackBot;
        assert_eq!(bot.name(), "triangle_attack_bot");
    }

    #[test]
    fn test_triangle_attack_bot_returns_move_on_empty_board() {
        let bot = TriangleAttackBot;
        let game = GameY::new(5);

        let chosen_move = bot.choose_move(&game);
        assert!(chosen_move.is_some());
    }

    #[test]
    fn test_triangle_attack_bot_returns_valid_coordinates() {
        let bot = TriangleAttackBot;
        let game = GameY::new(5);

        let coords = bot.choose_move(&game).unwrap();
        let index = coords.to_index(game.board_size());

        // Index should be within the valid range for a size-5 board (15 cells)
        assert!(index < 15);
    }

    #[test]
    fn test_triangle_attack_bot_returns_none_on_full_board() {
        let bot = TriangleAttackBot;
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

        assert!(game.available_cells().is_empty());
        let chosen_move = bot.choose_move(&game);
        assert!(chosen_move.is_none());
    }

    #[test]
    fn test_triangle_attack_bot_chooses_from_available_cells() {
        let bot = TriangleAttackBot;
        let mut game = GameY::new(3);

        game.add_move(Movement::Placement {
            player: PlayerId::new(0),
            coords: Coordinates::new(2, 0, 0),
        })
        .unwrap();

        let coords = bot.choose_move(&game).unwrap();
        let index = coords.to_index(game.board_size());

        assert!(game.available_cells().contains(&index));
    }

    #[test]
    fn test_triangle_attack_bot_multiple_calls_return_valid_moves() {
        let bot = TriangleAttackBot;
        let game = GameY::new(7);

        for _ in 0..10 {
            let coords = bot.choose_move(&game).unwrap();
            let index = coords.to_index(game.board_size());

            // Total cells for size 7 = 28
            assert!(index < 28);
            assert!(game.available_cells().contains(&index));
        }
    }
}