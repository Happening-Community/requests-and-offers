use crate::wasm_error;
use hdk::prelude::*;

/// Struct for DNA properties in a distributed network, holding the progenitor's public key.
#[derive(Serialize, Deserialize, SerializedBytes, Debug, Clone)]
pub struct DnaProperties {
    /// Public key of the progenitor node.
    pub progenitor_pubkey: String,
}

impl DnaProperties {
    /// Fetches DNA properties from the network, including the progenitor's public key.
    ///
    /// # Returns
    ///
    /// - `Ok(Self)`: Fetched `DnaProperties` instance.
    /// - `Err(ExternError)`: Error details.
    pub fn get() -> ExternResult<Self> {
        dna_info()?
            .modifiers
            .properties
            .try_into()
            .map_err(|err: SerializedBytesError| wasm_error(&err.to_string()))
    }

    /// Extracts and deserializes the progenitor's public key.
    ///
    /// # Returns
    ///
    /// - `Ok(AgentPubKey)`: Deserialized progenitor's public key.
    /// - `Err(ExternError)`: Error details.
    pub fn get_progenitor_pubkey() -> ExternResult<AgentPubKey> {
        let progenitor_pubkey_string = DnaProperties::get()?.progenitor_pubkey;

        AgentPubKey::try_from(progenitor_pubkey_string.clone())
            .map_err(|err| wasm_error(&format!("Deserialization error: {}", err)))
    }
}
