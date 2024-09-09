use hdk::prelude::*;
use utils::external_local_call;

pub fn check_if_agent_is_administrator(agent_pubkey: AgentPubKey) -> ExternResult<bool> {
  external_local_call(
    "check_if_agent_is_administrator",
    "administration",
    agent_pubkey,
  )
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct StatusInput {
  entity_original_action_hash: ActionHash,
  entity: String,
}

pub fn create_status(user_original_action_hash: ActionHash) -> ExternResult<Record> {
  external_local_call(
    "create_status",
    "administration",
    StatusInput {
      entity_original_action_hash: user_original_action_hash,
      entity: "users".to_string(),
    },
  )
}
