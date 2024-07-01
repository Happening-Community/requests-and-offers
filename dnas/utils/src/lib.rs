use hdk::prelude::*;

pub fn wasm_error(message: &str) -> WasmError {
    wasm_error!(WasmErrorInner::Guest(message.to_string()))
}
