use std::time::{SystemTime, UNIX_EPOCH};

use hdk::prelude::*;

pub mod dna_properties;

pub use dna_properties::DnaProperties;

pub fn check_if_progenitor() -> ExternResult<bool> {
  let progenitor_pubkey = DnaProperties::get_progenitor_pubkey()?;

  Ok(progenitor_pubkey == agent_info()?.agent_initial_pubkey)
}

pub fn now_in_micros() -> ExternResult<i64> {
  use WasmErrorInner::*;
  Ok(
    SystemTime::now()
      .duration_since(UNIX_EPOCH)
      .map_err(|_| wasm_error!(Guest("Could not get current time".to_string())))?
      .as_micros() as i64,
  )
}
