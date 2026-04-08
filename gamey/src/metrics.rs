use prometheus::{IntCounterVec, Histogram, register_int_counter_vec, register_histogram};
use lazy_static::lazy_static;

lazy_static! {
    pub static ref GAMES_PLAYED: IntCounterVec =
        register_int_counter_vec!(
            "games_played",
            "Total games played",
            &["bot"]
        ).unwrap();

    pub static ref RESPONSE_TIME: Histogram =
        register_histogram!(
            "response_time_seconds",
            "Response time in seconds"
        ).unwrap();
}