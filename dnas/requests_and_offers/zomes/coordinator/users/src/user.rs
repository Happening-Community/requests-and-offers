use hdk::prelude::*;
use users_integrity::*;
use WasmErrorInner::*;

use crate::external_calls::create_status;

#[hdk_extern]
pub fn create_user(user: User) -> ExternResult<Record> {
  let record = get_agent_user(agent_info()?.agent_initial_pubkey)?;
  if !record.is_empty() {
    return Err(wasm_error!(Guest(
      "You already have a User profile".to_string()
    )));
  }

  let user_hash = create_entry(&EntryTypes::User(user.clone()))?;
  let record = get(user_hash.clone(), GetOptions::default())?.ok_or(wasm_error!(Guest(
    "Could not find the newly created User profile".to_string()
  )))?;

  let path = Path::from("users");
  create_link(
    path.path_entry_hash()?,
    user_hash.clone(),
    LinkTypes::AllUsers,
    (),
  )?;

  create_link(
    agent_info()?.agent_initial_pubkey,
    user_hash.clone(),
    LinkTypes::MyUser,
    (),
  )?;

  let created_status_record = create_status(user_hash.clone())?;

  create_link(
    user_hash.clone(),
    created_status_record.action_address().clone(),
    LinkTypes::UserStatus,
    (),
  )?;

  Ok(record)
}

#[hdk_extern]
pub fn get_latest_user_record(original_action_hash: ActionHash) -> ExternResult<Option<Record>> {
  let links = get_links(original_action_hash.clone(), LinkTypes::UserUpdates, None)?;
  let latest_link = links
    .into_iter()
    .max_by(|link_a, link_b| link_a.timestamp.cmp(&link_b.timestamp));
  let latest_user_hash = match latest_link {
    Some(link) => link
      .target
      .clone()
      .into_action_hash()
      .ok_or(wasm_error!(Guest(
        "Could not find the latest User profile".to_string()
      )))?,
    None => original_action_hash.clone(),
  };
  get(latest_user_hash, GetOptions::default())
}

#[hdk_extern]
pub fn get_latest_user(original_action_hash: ActionHash) -> ExternResult<User> {
  let latest_user_record = get_latest_user_record(original_action_hash)?;
  let latest_user = latest_user_record
    .ok_or(wasm_error!(Guest(
      "Could not find the latest User profile".to_string()
    )))?
    .entry()
    .to_app_option()
    .map_err(|_| {
      wasm_error!(Guest(
        "Error while deserializing the latest User profile".to_string()
      ))
    })?
    .ok_or(wasm_error!(Guest(
      "Could not find the latest User profile".to_string()
    )))?;
  Ok(latest_user)
}

#[hdk_extern]
pub fn get_agent_user(author: AgentPubKey) -> ExternResult<Vec<Link>> {
  get_links(author, LinkTypes::MyUser, None)
}

#[hdk_extern]
pub fn get_user_agents(user_original_action_hash: ActionHash) -> ExternResult<Vec<AgentPubKey>> {
  let links = get_links(user_original_action_hash, LinkTypes::MyUser, None)?;
  let agent_pubkeys: Vec<AgentPubKey> = links
    .iter()
    .filter_map(|link| link.target.clone().into_agent_pub_key())
    .collect();

  Ok(agent_pubkeys)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateUserInput {
  pub original_action_hash: ActionHash,
  pub previous_action_hash: ActionHash,
  pub updated_user: User,
}

#[hdk_extern]
pub fn update_user(input: UpdateUserInput) -> ExternResult<Record> {
  let original_record = must_get_valid_record(input.original_action_hash.clone())?;

  let author = original_record.action().author().clone();
  if author != agent_info()?.agent_initial_pubkey {
    return Err(wasm_error!(Guest(
      "Only the author of a User profile can update it".to_string()
    )));
  }

  let updated_user_hash = update_entry(input.previous_action_hash.clone(), &input.updated_user)?;

  create_link(
    input.original_action_hash.clone(),
    updated_user_hash.clone(),
    LinkTypes::UserUpdates,
    (),
  )?;

  let record = get(updated_user_hash.clone(), GetOptions::default())?.ok_or(wasm_error!(Guest(
    "Could not find the newly updated User profile".to_string()
  )))?;

  Ok(record)
}
