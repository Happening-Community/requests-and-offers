use std::time::{SystemTime, UNIX_EPOCH};

use hdk::prelude::*;

/// Module for handling DNA properties related to the progenitor in a Holochain application.
pub mod dna_properties;

pub use dna_properties::DnaProperties;

/// Generates a custom error message for use within WebAssembly (Wasm) environments.
///
/// Wraps a given message into a `WasmError` type for errors thrown from Rust code in Wasm modules.
pub fn wasm_error(message: &str) -> WasmError {
    wasm_error!(WasmErrorInner::Guest(message.to_string()))
}

/// Checks if the current agent is the progenitor of the DNA properties.
///
/// Compares the progenitor's public key against the current agent's initial public key.
pub fn check_if_progenitor() -> ExternResult<bool> {
    let progenitor_pubkey = DnaProperties::get_progenitor_pubkey()?;

    Ok(progenitor_pubkey == agent_info()?.agent_initial_pubkey)
}

pub fn now_in_micros() -> ExternResult<i64> {
    Ok(SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|_| wasm_error("Could not get current time"))?
        .as_micros() as i64)
}
