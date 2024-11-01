use hdk::prelude::*;
use utils::{external_local_call, EntityActionHash, EntityAgent};

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

pub fn check_if_entity_is_accepted(input: EntityActionHash) -> ExternResult<bool> {
  external_local_call("check_if_entity_is_accepted", "administration", input)
}

pub fn get_accepted_entities(entity: String) -> ExternResult<Vec<Link>> {
  external_local_call("get_accepted_entities", "administration", entity)
}

pub fn delete_status(original_action_hash: EntityActionHash) -> ExternResult<bool> {
  external_local_call("delete_status", "administration", original_action_hash)
}
