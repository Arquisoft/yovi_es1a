//! Implementation of an easy-level bot
//!
//! This module contains the structure [`groupExpansionBot`]. This opponent attempts to 
//! play with a certain logic: it seeks to group its pieces by connecting new moves to those 
//! already on the board.

use crate::{Coordinates, GameY, YBot};
use rand::prelude::IndexedRandom;

/// A bot that chooses moves following the group's expansion strategy
///
/// 
/// To decide where to place its next piece, this bot follows this reasoning:
/// 1. It scans the board to locate all its pieces.
/// 2. It observes the neighboring squares of those pieces found.
/// 3. It filters out only the neighboring squares that are completely empty.
/// 4. It randomly chooses one of those free squares to grow its group.
///
/// If the bot is the first to play or if the opponent has cornered it, leaving 
/// it with no free neighbors, it will enter panic mode and place its piece in any 
/// available space on the board to avoid losing its turn.
/// 
/// # Example
///
/// ```
/// use gamey::{GameY, groupExpansionBot, YBot};
///
/// let bot = groupExpansionBot;
/// let game = GameY::new(5);
///
/// // The bot will always return Some when there are available moves
/// let chosen_move = bot.choose_move(&game);
/// assert!(chosen_move.is_some());
/// ```


pub struct GroupExpansionBot;

impl YBot for GroupExpansionBot {
    fn name(&self) -> &str {
        "group_expansion_bot"
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        let available_cells = board.available_cells();
        if available_cells.is_empty() {
            return None;
        }
        let actual_player = board.next_player()?;
        let bot_cells = board.cells_for_player(actual_player);
        let _candidates = obtein_all_available_neighbors(bot_cells,board, available_cells);
        if _candidates.is_empty() {
            let cell = available_cells.choose(&mut rand::rng())?;
            let coordinates = Coordinates::from_index(*cell, board.board_size());
            return Some(coordinates);
        }
        let cell = _candidates.choose(&mut rand::rng())?;
        let coordinates = Coordinates::from_index(*cell, board.board_size());
        Some(coordinates)
    }
    
}

fn obtein_all_available_neighbors(bot_cells: Vec<Coordinates>, board: &GameY, available_cells: &Vec<u32>) -> Vec<u32>{
        let mut candidates = Vec::new();

        for cell in bot_cells {
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
    fn test_group_expansion_bot_name() {
        let bot = GroupExpansionBot;
        assert_eq!(bot.name(), "group_expansion_bot");
    }

    #[test]
    fn test_group_expansion_bot_returns_move_on_empty_board() {
        let bot = GroupExpansionBot;
        let game = GameY::new(5);

        let chosen_move = bot.choose_move(&game);
        assert!(chosen_move.is_some());
    }

    #[test]
    fn test_group_expansion_bot_returns_valid_coordinates() {
        let bot = GroupExpansionBot;
        let game = GameY::new(5);

        let coords = bot.choose_move(&game).unwrap();
        let index = coords.to_index(game.board_size());

        // Index should be within the valid range for a size-5 board
        // Total cells = (5 * 6) / 2 = 15
        assert!(index < 15);
    }

    #[test]
    fn test_group_expansion_bot_returns_none_on_full_board() {
        let bot = GroupExpansionBot;
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
    fn test_group_expansion_bot_chooses_from_available_cells() {
        let bot = GroupExpansionBot;
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
    fn test_group_expansion_bot_multiple_calls_return_valid_moves() {
        let bot = GroupExpansionBot;
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
