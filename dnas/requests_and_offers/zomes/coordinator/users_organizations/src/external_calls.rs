use hdk::prelude::*;
use utils::{external_local_call, EntityActionHash, EntityAgent};

/// Checks if a given agent is an administrator for a specified entity.
///
/// # Arguments
///
/// * [entity](cci:1://file:///home/soushi888/Projets/Holochain/requests-and-offers/dnas/requests_and_offers/zomes/coordinator/users_organizations/src/external_calls.rs:28:0-30:1) - A string slice that holds the name of the entity.
/// * `agent_pubkey` - The public key of the agent to check.
///
/// # Returns
///
/// * `ExternResult<bool>` - Returns `true` if the agent is an administrator, otherwise `false`.
pub fn check_if_agent_is_administrator(
  entity: &str,
  agent_pubkey: AgentPubKey,
) -> ExternResult<bool> {
  external_local_call(
    "check_if_agent_is_administrator",
    "administration",
    EntityAgent {
      entity: entity.to_string(),
      agent_pubkey,
    },
  )
}

/// Creates a status entry for a user based on their original action hash.
///
/// # Arguments
///
/// * `user_original_action_hash` - The action hash of the user for whom the status is being created.
///
/// # Returns
///
/// * `ExternResult<Record>` - Returns the newly created status record.
pub fn create_status(user_original_action_hash: ActionHash) -> ExternResult<Record> {
  external_local_call(
    "create_status",
    "administration",
    EntityActionHash {
      entity_original_action_hash: user_original_action_hash,
      entity: "users".to_string(),
    },
  )
}

/// Retrieves all accepted entities of a specific type.
///
/// # Arguments
///
/// * [entity](cci:1://file:///home/soushi888/Projets/Holochain/requests-and-offers/dnas/requests_and_offers/zomes/coordinator/users_organizations/src/external_calls.rs:28:0-30:1) - A string representing the type of entities to retrieve.
///
/// # Returns
///
/// * `ExternResult<Vec<Link>>` - Returns a vector of links to the accepted entities.
pub fn get_accepted_entities(entity: String) -> ExternResult<Vec<Link>> {
  external_local_call("get_accepted_entities", "administration", entity)
}

/// Deletes the status of an entity based on its original action hash.
///
/// # Arguments
///
/// * `original_action_hash` - An `EntityActionHash` containing the original action hash and entity name.
///
/// # Returns
///
/// * `ExternResult<bool>` - Returns `true` if the status was successfully deleted, otherwise `false`.
pub fn delete_status(original_action_hash: EntityActionHash) -> ExternResult<bool> {
  external_local_call("delete_status", "administration", original_action_hash)
}
