use hdk::prelude::*;

/// Module for handling DNA properties related to the progenitor in a Holochain application.
pub mod dna_properties;

use dna_properties::DnaProperties;

/// Generates a custom error message for use within WebAssembly (Wasm) environments.
///
/// Wraps a given message into a `WasmError` type for errors thrown from Rust code in Wasm modules.
///
/// # Parameters
///
/// * `message` - Error message string slice.
///
/// # Returns
///
/// * `WasmError` - Wrapped error message.
pub fn wasm_error(message: &str) -> WasmError {
    wasm_error!(WasmErrorInner::Guest(message.to_string()))
}

/// Checks if the current agent is the progenitor of the DNA properties.
///
/// Compares the progenitor's public key against the current agent's initial public key.
///
/// # Returns
///
/// * `ExternResult<bool>` - Boolean indicating if the current agent is the progenitor.
pub fn check_if_progenitor() -> ExternResult<bool> {
    let progenitor_pubkey = DnaProperties::get_progenitor_pubkey()?;

    Ok(progenitor_pubkey == agent_info()?.agent_initial_pubkey)
}
