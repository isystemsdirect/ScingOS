// Stub Rust modules for compilation
// src/lib.rs

pub mod clipboard;
pub mod db;
pub mod hotkey;
pub mod commands;

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
