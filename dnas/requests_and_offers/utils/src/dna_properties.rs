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
        let progegenitor_pubkey_string = DnaProperties::get()?.progenitor_pubkey;

        let progenitor_pubkey =
            AgentPubKey::try_from(progegenitor_pubkey_string.clone()).map_err(|err| {
                wasm_error(&format!(
                    "Error while deserializing the progenitor pubkey: {}",
                    err
                ))
            })?;

        Ok(progenitor_pubkey)
    }
}
