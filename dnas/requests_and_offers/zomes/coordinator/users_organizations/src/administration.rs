use hdk::prelude::*;
use users_organizations_integrity::{LinkTypes, Organization};
use WasmErrorInner::*;

use crate::external_calls::check_if_agent_is_administrator;

#[hdk_extern]
pub fn get_all_users(_: ()) -> ExternResult<Vec<Link>> {
  if !check_if_agent_is_administrator("network", agent_info()?.agent_initial_pubkey)? {
    return Err(wasm_error!(Guest(
      "Only administrators can retrieve all users".to_string()
    )));
  }

  let path = Path::from("users");
  get_links(GetLinksInputBuilder::try_new(path.path_entry_hash()?, LinkTypes::AllUsers)?.build())
}

#[hdk_extern]
pub fn get_user_status_link(user_original_action_hash: ActionHash) -> ExternResult<Option<Link>> {
  let links = get_links(
    GetLinksInputBuilder::try_new(user_original_action_hash.clone(), LinkTypes::UserStatus)?
      .build(),
  )?;

  let link = links.first().cloned();

  Ok(link)
}

#[hdk_extern]
pub fn get_all_organizations(_: ()) -> ExternResult<Vec<Link>> {
  let path = Path::from("organizations");

  get_links(
    GetLinksInputBuilder::try_new(path.path_entry_hash()?, LinkTypes::AllOrganizations)?.build(),
  )
}

#[hdk_extern]
pub fn get_organization_status_link(
  organization_original_action_hash: ActionHash,
) -> ExternResult<Option<Link>> {
  let links = get_links(
    GetLinksInputBuilder::try_new(
      organization_original_action_hash.clone(),
      LinkTypes::OrganizationStatus,
    )?
    .build(),
  )?;

  let link = links.first().cloned();

  Ok(link)
}
