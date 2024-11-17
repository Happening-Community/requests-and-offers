use hdk::prelude::{wasm_error, WasmError, WasmErrorInner::*};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum UtilsError {
  #[error("Could not find the {0}'s action hash")]
  ActionHashNotFound(&'static str),
}

impl From<UtilsError> for WasmError {
  fn from(err: UtilsError) -> Self {
    wasm_error!(Guest(err.to_string()))
  }
}
