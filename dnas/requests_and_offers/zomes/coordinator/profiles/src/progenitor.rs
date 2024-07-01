use hdk::prelude::*;

#[derive(Serialize, Deserialize, SerializedBytes, Debug, Clone)]
pub struct DnaProperties {
    pub progenitor_pubkey: String,
}

impl DnaProperties {
    pub fn get() -> ExternResult<Self> {
        dna_info()?
            .modifiers
            .properties
            .try_into()
            .or(Err(wasm_error!(WasmErrorInner::Guest(String::from(
                "Error deserializing DNA properties",
            )))))
    }
}

#[hdk_extern]
pub fn get_dna_properties(_: ()) -> ExternResult<DnaProperties> {
    DnaProperties::get()
}
