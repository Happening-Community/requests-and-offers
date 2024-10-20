use hdk::prelude::*;
use users_organizations_integrity::*;
use WasmErrorInner::*;

use crate::{
  external_calls::create_status,
  user::{get_agent_user, get_latest_user},
};

#[hdk_extern]
pub fn create_organization(organization: Organization) -> ExternResult<Record> {
  let user_links = get_agent_user(agent_info()?.agent_initial_pubkey)?;
  if user_links.is_empty() {
    return Err(wasm_error!(Guest(
      "You must first create a User profile".to_string()
    )));
  }

  let organization_hash = create_entry(&EntryTypes::Organization(organization.clone()))?;
  let record = get(organization_hash.clone(), GetOptions::default())?.ok_or(wasm_error!(Guest(
    "Could not find the newly created Organization profile".to_string()
  )))?;

  let path = Path::from("organizations");
  create_link(
    path.path_entry_hash()?,
    organization_hash.clone(),
    LinkTypes::AllOrganizations,
    (),
  )?;

  let created_status_record = create_status(organization_hash.clone())?;

  create_link(
    organization_hash.clone(),
    created_status_record.action_address().clone(),
    LinkTypes::OrganizationStatus,
    (),
  )?;

  create_link(
    organization_hash,
    user_links[0].target.clone(),
    LinkTypes::OrganizationCoordinators,
    (),
  )?;

  Ok(record)
}

#[hdk_extern]
pub fn get_latest_organization_record(
  original_action_hash: ActionHash,
) -> ExternResult<Option<Record>> {
  let links = get_links(
    GetLinksInputBuilder::try_new(original_action_hash.clone(), LinkTypes::OrganizationUpdates)?
      .build(),
  )?;
  let latest_link = links
    .into_iter()
    .max_by(|link_a, link_b| link_a.timestamp.cmp(&link_b.timestamp));
  let latest_organization_hash = match latest_link {
    Some(link) => link
      .target
      .clone()
      .into_action_hash()
      .ok_or(wasm_error!(Guest(
        "Could not find the latest Organization profile".to_string()
      )))?,
    None => original_action_hash.clone(),
  };
  get(latest_organization_hash, GetOptions::default())
}

#[hdk_extern]
pub fn get_latest_organization(original_action_hash: ActionHash) -> ExternResult<Organization> {
  let latest_organization_record = get_latest_organization_record(original_action_hash)?;
  let latest_organization = latest_organization_record
    .ok_or(wasm_error!(Guest(
      "Could not find the latest Organization profile".to_string()
    )))?
    .entry()
    .to_app_option()
    .map_err(|_| {
      wasm_error!(Guest(
        "Error while deserializing the latest Organization profile".to_string()
      ))
    })?
    .ok_or(wasm_error!(Guest(
      "Could not find the latest Organization profile".to_string()
    )))?;
  Ok(latest_organization)
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct OrganizationAndUserInput {
  pub organization_original_action_hash: ActionHash,
  pub user_original_action_hash: ActionHash,
}

#[hdk_extern]
pub fn add_member_to_organization(input: OrganizationAndUserInput) -> ExternResult<bool> {
  let agent_user_links = get_agent_user(agent_info()?.agent_initial_pubkey)?;
  if agent_user_links.is_empty() {
    return Err(wasm_error!(Guest(
      "You must first create a User profile".to_string()
    )));
  }

  if !is_organization_coordinator(OrganizationAndUserInput {
    organization_original_action_hash: input.organization_original_action_hash.clone(),
    user_original_action_hash: agent_user_links[0]
      .target
      .clone()
      .into_action_hash()
      .ok_or(wasm_error!(Guest(
        "Could not find the user's action hash".to_string()
      )))?,
  })? {
    return Err(wasm_error!(Guest(
      "Only coordinators can add members".to_string()
    )));
  }

  if !is_organization_member(input.clone())? {
    return Err(wasm_error!(Guest(
      "The invited user is already a member".to_string()
    )));
  }

  create_link(
    input.organization_original_action_hash.clone(),
    input.user_original_action_hash.clone(),
    LinkTypes::OrganizationMembers,
    (),
  )?;

  create_link(
    input.user_original_action_hash.clone(),
    input.organization_original_action_hash.clone(),
    LinkTypes::UserOrganizations,
    (),
  )?;

  Ok(true)
}

#[hdk_extern]
pub fn invite_member_to_organization(input: OrganizationAndUserInput) -> ExternResult<Record> {
  unimplemented!()
}

#[hdk_extern]
pub fn get_organization_members(original_action_hash: ActionHash) -> ExternResult<Vec<User>> {
  let links = get_links(
    GetLinksInputBuilder::try_new(original_action_hash.clone(), LinkTypes::OrganizationMembers)?
      .build(),
  )?;

  let users = links
    .into_iter()
    .map(|link| {
      get_latest_user(
        link
          .target
          .clone()
          .into_action_hash()
          .ok_or(wasm_error!(Guest(
            "Could not find the user's action hash".to_string()
          )))?,
      )
    })
    .collect::<ExternResult<Vec<User>>>()?;

  Ok(users)
}

#[hdk_extern]
pub fn is_organization_member(input: OrganizationAndUserInput) -> ExternResult<bool> {
  unimplemented!()
}

#[hdk_extern]
pub fn add_coordinator_to_organization(input: OrganizationAndUserInput) -> ExternResult<Record> {
  unimplemented!()
}

#[hdk_extern]
pub fn invite_coordinator_to_organization(input: OrganizationAndUserInput) -> ExternResult<Record> {
  unimplemented!()
}

#[hdk_extern]
pub fn get_organization_coordinators(original_action_hash: ActionHash) -> ExternResult<Vec<User>> {
  unimplemented!()
}

#[hdk_extern]
pub fn is_organization_coordinator(input: OrganizationAndUserInput) -> ExternResult<bool> {
  unimplemented!()
}

#[hdk_extern]
pub fn leave_organization(original_action_hash: ActionHash) -> ExternResult<bool> {
  unimplemented!()
}

#[hdk_extern]
pub fn remove_organization_coordinator(input: OrganizationAndUserInput) -> ExternResult<bool> {
  unimplemented!()
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateOrganizationInput {
  pub original_action_hash: ActionHash,
  pub previous_action_hash: ActionHash,
  pub updated_organization: Organization,
}

#[hdk_extern]
pub fn update_organization(input: UpdateOrganizationInput) -> ExternResult<Record> {
  let original_record = must_get_valid_record(input.original_action_hash.clone())?;

  let author = original_record.action().author().clone();
  if author != agent_info()?.agent_initial_pubkey {
    return Err(wasm_error!(Guest(
      "Only the author of a Organization profile can update it".to_string()
    )));
  }

  let updated_organization_hash = update_entry(
    input.previous_action_hash.clone(),
    &input.updated_organization,
  )?;

  create_link(
    input.original_action_hash.clone(),
    updated_organization_hash.clone(),
    LinkTypes::OrganizationUpdates,
    (),
  )?;

  let record =
    get(updated_organization_hash.clone(), GetOptions::default())?.ok_or(wasm_error!(Guest(
      "Could not find the newly updated Organization profile".to_string()
    )))?;

  Ok(record)
}
