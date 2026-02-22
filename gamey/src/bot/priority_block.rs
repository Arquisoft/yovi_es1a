//! Implementation of an medium-level bot
//!
//! This module contains the structure [`PriorityBlockBot`]. This opponent attempts to 
//! play with a tactical logic: it prioritizes blocking the opponent's paths while 
//! simultaneously seeking to expand its own groups, with a special focus on edge defense.

use crate::{Coordinates, GameY, YBot};
use rand::prelude::IndexedRandom;

/// A bot that chooses moves following a defensive expansion strategy
///
/// To decide where to place its next piece, this bot follows this reasoning:
/// 1. It identifies all available (empty) cells on the board.
/// 2. For each empty cell, it evaluates its immediate neighbors.
/// 3. It assigns a base score to the cell: +1 point for every adjacent allied piece, 
///    and +2 points for every adjacent enemy piece (highly aggressive blocking).
/// 4. It applies an edge-defense modifier: if the empty cell is located on the edge 
///    of the board and touches an enemy piece, it receives an additional +3 points 
///    to prevent the opponent from easily claiming a side.
/// 5. It selects the cell with the highest total score.
/// 6. If multiple cells share the highest score, it randomly chooses one among the best.
///
/// If the board is completely empty (e.g., if it plays the first turn of the game) or 
/// if no adjacent pieces are found anywhere, all empty cells will tie with a score of 0, 
/// and the bot will simply place its piece in any random available space.
/// 
/// # Example
///
/// ```
/// use gamey::{GameY, PriorityBlockBot, YBot};
///
/// let bot = PriorityBlockBot;
/// let game = GameY::new(5);
///
/// // The bot will always return Some when there are available moves
/// let chosen_move = bot.choose_move(&game);
/// assert!(chosen_move.is_some());
/// ```


pub struct PriorityBlockBot;

impl YBot for PriorityBlockBot {
    fn name(&self) -> &str {
        "priority_block_bot"   
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        let available_cells = board.available_cells();
        if available_cells.is_empty() {
            return None;
        }
        get_better_cell(board,available_cells)      
    }
    
}

fn get_better_cell(board: &GameY, available_cells: &Vec<u32>) -> Option<Coordinates> {
    let mut max_score = -1;
    let mut best_cells = Vec::new();
    let bot_id = board.next_player()?;
    for &cell in available_cells {
        let mut actual_score = 0;
        let coords = Coordinates::from_index(cell, board.board_size());
        let neighbors = board.get_neighbors(&coords);
        
        let is_edge = coords.x() == 0 || coords.y() == 0 || coords.z() == 0;
        let mut touches_enemy = false;

        for neighbor in neighbors {
            let cell_propietary = board.player_at(&neighbor);
            
            if cell_propietary == Some(bot_id) {
                actual_score += 1; 
            } else if cell_propietary.is_some() { 
                actual_score += 2; 
                touches_enemy = true;
            }       
        }

        if is_edge && touches_enemy {
            actual_score += 3;
        }

        if max_score < actual_score {
            max_score = actual_score;
            best_cells.clear();
            best_cells.push(cell);
        } else if max_score == actual_score {
            best_cells.push(cell);
        } 
    }
    let chosen_cell = best_cells.choose(&mut rand::rng())?;
    Some(Coordinates::from_index(*chosen_cell, board.board_size()))
}

    


#[cfg(test)]
mod tests {
    use super::*;
    use crate::{Movement, PlayerId};

    #[test]
    fn test_priority_block_bot_name() {
        let bot = PriorityBlockBot;
        assert_eq!(bot.name(), "priority_block_bot");
    }

    #[test]
    fn test_priority_block_bot_returns_move_on_empty_board() {
        let bot = PriorityBlockBot;
        let game = GameY::new(5);

        let chosen_move = bot.choose_move(&game);
        assert!(chosen_move.is_some());
    }

    #[test]
    fn test_priority_block_bot_returns_valid_coordinates() {
        let bot = PriorityBlockBot;
        let game = GameY::new(5);

        let coords = bot.choose_move(&game).unwrap();
        let index = coords.to_index(game.board_size());

        // Index should be within the valid range for a size-5 board
        // Total cells = (5 * 6) / 2 = 15
        assert!(index < 15);
    }

    #[test]
    fn test_priority_block_bot_returns_none_on_full_board() {
        let bot = PriorityBlockBot;
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
    fn test_priority_block_bot_chooses_from_available_cells() {
        let bot = PriorityBlockBot;
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
    fn test_priority_block_bot_multiple_calls_return_valid_moves() {
        let bot = PriorityBlockBot;
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
