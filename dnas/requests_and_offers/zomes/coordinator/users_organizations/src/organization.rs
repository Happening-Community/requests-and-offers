use hdk::prelude::*;
use users_organizations_integrity::*;
use WasmErrorInner::*;

use crate::{external_calls::create_status, user::get_agent_user};

#[hdk_extern]
pub fn create_organization(organization: Organization) -> ExternResult<Record> {
  let user = get_agent_user(agent_info()?.agent_initial_pubkey)?;
  if user.is_empty() {
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
