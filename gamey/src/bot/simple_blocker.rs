//! Implementation of a reactive easy-level bot
//!
//! This module contains the structure [`SimpleBlockerBot`]. This opponent attempts to 
//! play with a defensive logic: it seeks to obstruct the opponent's progress by 
//! placing its pieces in the immediate vicinity of the rival's pieces.

use crate::{Coordinates, GameY, PlayerId, YBot};
use rand::prelude::IndexedRandom;

/// A bot that chooses moves following the simple blocking strategy
///
/// To decide where to place its next piece, this bot follows this reasoning:
/// 1. It identifies the opponent's ID.
/// 2. It scans the board to locate all the opponent's pieces.
/// 3. It observes the neighboring squares of those enemy pieces.
/// 4. It filters out only the neighboring squares that are completely empty.
/// 5. It randomly chooses one of those free squares to block the opponent's expansion.
///
/// If the opponent has no pieces on the board (first turn) or if all opponent's 
/// neighbors are already occupied, it will enter panic mode and place its piece 
/// in any available space on the board.
/// 
/// # Example
///
/// ```
/// use gamey::{GameY, SimpleBlockerBot, YBot};
///
/// let bot = SimpleBlockerBot;
/// let game = GameY::new(5);
///
/// // The bot will always return Some when there are available moves
/// let chosen_move = bot.choose_move(&game);
/// assert!(chosen_move.is_some());
/// ```
pub struct SimpleBlockerBot;

impl YBot for SimpleBlockerBot {
    fn name(&self) -> &str {
        "simple_blocker_bot"
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        let available_cells = board.available_cells();
        if available_cells.is_empty() {
            return None;
        }

        // Identify current player and deduce the opponent
        let my_id = board.next_player()?;
        let enemy_id = if my_id.id() == 0 {
            PlayerId::new(1)
        } else {
            PlayerId::new(0)
        };

        // Locate opponent's pieces
        let enemy_cells = board.cells_for_player(enemy_id);

        // Find available spots to block the opponent
        let candidates = obtain_enemy_neighbors(enemy_cells, board, &available_cells);

        if candidates.is_empty() {
            // Panic mode: if no blocking move is found, play randomly
            let cell_index = available_cells.choose(&mut rand::rng())?;
            let coordinates = Coordinates::from_index(*cell_index, board.board_size());
            Some(coordinates)
        } else {
            // Blocking move: choose a random neighbor of the opponent
            let cell_index = candidates.choose(&mut rand::rng())?;
            let coordinates = Coordinates::from_index(*cell_index, board.board_size());
            Some(coordinates)
        }
    }
}

/// Helper function to find empty cells adjacent to opponent's pieces
fn obtain_enemy_neighbors(enemy_cells: Vec<Coordinates>,board: &GameY,available_cells: &Vec<u32>,) -> Vec<u32> {
    let mut candidates = Vec::new();

    for cell in enemy_cells {
        let neighbors = board.get_neighbors(&cell);
        for neighbor in neighbors {
            let neighbor_index = neighbor.to_index(board.board_size());
            if available_cells.contains(&neighbor_index) && !candidates.contains(&neighbor_index) {
                candidates.push(neighbor_index);
            }
        }
    }
    candidates
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{Movement, PlayerId};

    #[test]
    fn test_simple_blocker_bot_name() {
        let bot = SimpleBlockerBot;
        assert_eq!(bot.name(), "simple_blocker_bot");
    }

    #[test]
    fn test_simple_blocker_bot_returns_move_on_empty_board() {
        let bot = SimpleBlockerBot;
        let game = GameY::new(5);

        let chosen_move = bot.choose_move(&game);
        assert!(chosen_move.is_some());
    }

    #[test]
    fn test_simple_blocker_bot_returns_none_on_full_board() {
        let bot = SimpleBlockerBot;
        let mut game = GameY::new(2);

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

        let chosen_move = bot.choose_move(&game);
        assert!(chosen_move.is_none());
    }

    #[test]
    fn test_simple_blocker_bot_chooses_from_available_cells() {
        let bot = SimpleBlockerBot;
        let mut game = GameY::new(3);

        game.add_move(Movement::Placement {
            player: PlayerId::new(1),
            coords: Coordinates::new(2, 0, 0),
        })
        .unwrap();

        let coords = bot.choose_move(&game).unwrap();
        let index = coords.to_index(game.board_size());

        assert!(game.available_cells().contains(&index));
    }
}