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
