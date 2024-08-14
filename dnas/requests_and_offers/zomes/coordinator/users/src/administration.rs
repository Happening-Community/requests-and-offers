use hdk::prelude::*;
use users_integrity::LinkTypes;
use utils::wasm_error;

use crate::external_calls::check_if_agent_is_administrator;

#[hdk_extern]
pub fn get_all_users(_: ()) -> ExternResult<Vec<Link>> {
  if !check_if_agent_is_administrator(agent_info()?.agent_initial_pubkey)? {
    return Err(wasm_error("Only administrators can retrieve all users"));
  }

  let path = Path::from("all_users");
  get_links(path.path_entry_hash()?, LinkTypes::AllUsers, None)
}

#[hdk_extern]
pub fn get_profile_status_link(
  user_original_action_hash: ActionHash,
) -> ExternResult<Option<Link>> {
  let links = get_links(
    user_original_action_hash.clone(),
    LinkTypes::ProfileStatus,
    None,
  )?;

  let link = links.first().cloned();

  Ok(link)
}
