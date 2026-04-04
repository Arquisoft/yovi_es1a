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
 
        let mut scored: Vec<(u32, i32)> = available_cells
            .iter()
            .map(|&idx| {
                let coords = Coordinates::from_index(idx, board_size);
                let score = score_cell(board, &coords, actual_player, board_size);
                (idx, score)
            })
            .collect();
 
        scored.sort_by(|a, b| b.1.cmp(&a.1));
 
        let top_score = scored[0].1;
        let top_candidates: Vec<u32> = scored
            .iter()
            .filter(|(_, s)| *s >= top_score - 1)
            .map(|(idx, _)| *idx)
            .collect();
 
        let chosen = top_candidates.choose(&mut rand::rng()).copied()?;
        Some(Coordinates::from_index(chosen, board_size))
    }
}
 
fn score_cell(board: &GameY, coords: &Coordinates, player: PlayerId, board_size: u32) -> i32 {
    let mut score = 0i32;
 
    let my_neighbors = count_my_neighbors(board, coords, player);
    score += my_neighbors as i32 * 3;
 
    if my_neighbors >= 2 {
        score += 5;
    }
 
    let edge_score = edge_proximity(coords, board_size);
    score += edge_score;
 
    if my_neighbors == 0 {
        score -= 2;
    }
 
    score
}
 
fn edge_proximity(coords: &Coordinates, board_size: u32) -> i32 {
    let x = coords.x() as i32;
    let y = coords.y() as i32;
    let z = coords.z() as i32;
 
    let mut bonus = 0i32;
 
    if x == 0 { bonus += 3; }
    else if x == 1 { bonus += 1; }
 
    if y == 0 { bonus += 3; }
    else if y == 1 { bonus += 1; }
 
    if z == 0 { bonus += 3; }
    else if z == 1 { bonus += 1; }
 
    bonus
}
 
fn count_my_neighbors(board: &GameY, coords: &Coordinates, my_id: PlayerId) -> usize {
    board.get_neighbors(coords)
        .iter()
        .filter(|n| board.player_at(n) == Some(my_id))
        .count()
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
        assert!(index < 15);
    }
 
    #[test]
    fn test_triangle_attack_bot_returns_none_on_full_board() {
        let bot = TriangleAttackBot;
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
        assert!(game.available_cells().is_empty());
        assert!(bot.choose_move(&game).is_none());
    }
 
    #[test]
    fn test_triangle_attack_bot_chooses_from_available_cells() {
        let bot = TriangleAttackBot;
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
    fn test_triangle_attack_bot_multiple_calls_return_valid_moves() {
        let bot = TriangleAttackBot;
        let game = GameY::new(7);
        for _ in 0..10 {
            let coords = bot.choose_move(&game).unwrap();
            let index = coords.to_index(game.board_size());
            assert!(index < 28);
            assert!(game.available_cells().contains(&index));
        }
    }
}