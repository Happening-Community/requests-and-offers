use crate::wasm_error;
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
            .map_err(|err: SerializedBytesError| wasm_error(&err.to_string()))
    }

    pub fn get_progenitor_pubkey() -> ExternResult<AgentPubKey> {
        let progenitor_pubkey_string = DnaProperties::get()?.progenitor_pubkey;

        AgentPubKey::try_from(progenitor_pubkey_string.clone())
            .map_err(|err| wasm_error(&format!("Deserialization error: {}", err)))
    }
}
