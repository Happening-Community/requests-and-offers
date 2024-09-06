use hdk::prelude::*;
use utils::external_local_call;

// pub fn get_agent_user_hash(agent_pubkey: AgentPubKey) -> ExternResult<Option<ActionHash>> {
//   external_local_call("get_agent_user_hash", "users", agent_pubkey)
// }

pub fn get_user_status_link(user_original_hash: ActionHash) -> ExternResult<Option<Link>> {
  external_local_call("get_user_status_link", "users", user_original_hash)
}
