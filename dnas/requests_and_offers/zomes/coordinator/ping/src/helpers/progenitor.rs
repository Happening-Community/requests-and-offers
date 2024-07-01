use hdk::prelude::*;

#[derive(Serialize, Deserialize, SerializedBytes, Debug, Clone)]
pub struct DnaProperties {
    pub developer_address: String,
}

impl DnaProperties {
    pub fn get() -> ExternResult<DnaProperties> {
        zome_info()
            .map_err(|e| wasm_error!(WasmErrorInner::Guest(e.to_string())))
            .and_then(|info| {
                info.properties.try_into().map_err(|_| {
                    wasm_error!(WasmErrorInner::Guest(
                        "Failed to get properties".to_string()
                    ))
                })
            })
    }
}
