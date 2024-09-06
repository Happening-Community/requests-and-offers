use hdk::prelude::*;
use utils::external_local_call;

pub fn check_if_entity_is_administrator(entity_action_hash: ActionHash) -> ExternResult<bool> {
  external_local_call(
    "check_if_entity_is_administrator",
    "administration",
    entity_action_hash,
  )
}

pub fn create_status(user_original_action_hash: ActionHash) -> ExternResult<Record> {
  external_local_call("create_status", "administration", user_original_action_hash)
}
