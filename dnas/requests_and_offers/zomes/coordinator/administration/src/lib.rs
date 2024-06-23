pub mod administration;
mod external_calls;

use hdk::prelude::*;

#[hdk_extern]
pub fn init(_: ()) -> ExternResult<InitCallbackResult> {
    Ok(InitCallbackResult::Pass)
}

fn wasm_error(message: &str) -> WasmError {
    wasm_error!(WasmErrorInner::Guest(message.to_string()))
}
