use crate::wasm_error;
use hdk::prelude::*;

/// Struct for DNA properties in a distributed network as declared in the DNA manifest.
#[derive(Serialize, Deserialize, SerializedBytes, Debug, Clone)]
pub struct DnaProperties {
    /// Agent public key of the progenitor node.
    pub progenitor_pubkey: String,
}

impl DnaProperties {
    /// Fetches DNA properties from the network, including the progenitor's public key.
    pub fn get() -> ExternResult<Self> {
        dna_info()?
            .modifiers
            .properties
            .try_into()
            .map_err(|err: SerializedBytesError| wasm_error(&err.to_string()))
    }

    /// Extracts and deserializes the progenitor's public key.
    pub fn get_progenitor_pubkey() -> ExternResult<AgentPubKey> {
        let progenitor_pubkey_string = DnaProperties::get()?.progenitor_pubkey;

        AgentPubKey::try_from(progenitor_pubkey_string.clone())
            .map_err(|err| wasm_error(&format!("Deserialization error: {}", err)))
    }
}
