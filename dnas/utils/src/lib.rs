use hdk::prelude::*;

pub mod dna_properties;

use dna_properties::DnaProperties;

pub fn wasm_error(message: &str) -> WasmError {
    wasm_error!(WasmErrorInner::Guest(message.to_string()))
}

pub fn check_if_progenitor() -> ExternResult<bool> {
    let progenitor_pubkey = DnaProperties::get_progenitor_pubkey()?;

    Ok(progenitor_pubkey == agent_info()?.agent_initial_pubkey)
}
