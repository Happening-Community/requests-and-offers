use hdk::prelude::*;
use users_integrity::*;
use utils::wasm_error;

use crate::external_calls::create_status;

#[hdk_extern]
pub fn create_user(user: User) -> ExternResult<Record> {
  let record = get_agent_user(agent_info()?.agent_initial_pubkey)?;
  if !record.is_empty() {
    return Err(wasm_error("You already have a User profile"));
  }

  let user_hash = create_entry(&EntryTypes::User(user.clone()))?;
  let record = get(user_hash.clone(), GetOptions::default())?
    .ok_or(wasm_error("Could not find the newly created User profile"))?;

  let path = Path::from("all_users");
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
    LinkTypes::ProfileStatus,
    (),
  )?;

  Ok(record)
}

#[hdk_extern]
pub fn get_latest_user_record(original_action_hash: ActionHash) -> ExternResult<Option<Record>> {
  let links = get_links(
    GetLinksInputBuilder::try_new(original_action_hash.clone(), LinkTypes::UserUpdates)?.build(),
  )?;
  let latest_link = links
    .into_iter()
    .max_by(|link_a, link_b| link_a.timestamp.cmp(&link_b.timestamp));
  let latest_user_hash = match latest_link {
    Some(link) => link
      .target
      .clone()
      .into_action_hash()
      .ok_or(wasm_error("Could not find the latest User profile"))?,
    None => original_action_hash.clone(),
  };
  get(latest_user_hash, GetOptions::default())
}

#[hdk_extern]
pub fn get_latest_user(original_action_hash: ActionHash) -> ExternResult<User> {
  let latest_user_record = get_latest_user_record(original_action_hash)?;
  let latest_user = latest_user_record
    .ok_or(wasm_error("Could not find the latest User profile"))?
    .entry()
    .to_app_option()
    .map_err(|_| wasm_error("wasm_error while deserializing the latest User profile"))?
    .ok_or(wasm_error("Could not find the latest User profile"))?;
  Ok(latest_user)
}

#[hdk_extern]
pub fn get_agent_user(author: AgentPubKey) -> ExternResult<Vec<Link>> {
  get_links(GetLinksInputBuilder::try_new(author, LinkTypes::MyUser)?.build())
}

#[hdk_extern]
pub fn get_agent_user_hash(agent_pubkey: AgentPubKey) -> ExternResult<Option<ActionHash>> {
  let agent_user_links = get_agent_user(agent_pubkey)?;

  if agent_user_links.is_empty() {
    Ok(None)
  } else {
    Ok(Some(
      agent_user_links[0]
        .target
        .clone()
        .into_action_hash()
        .ok_or(wasm_error("Could not find the agent User profile hash"))?,
    ))
  }
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
    return Err(wasm_error(
      "Only the author of a User profile can update it",
    ));
  }

  let updated_user_hash = update_entry(input.previous_action_hash.clone(), &input.updated_user)?;

  create_link(
    input.original_action_hash.clone(),
    updated_user_hash.clone(),
    LinkTypes::UserUpdates,
    (),
  )?;

  let record = get(updated_user_hash.clone(), GetOptions::default())?
    .ok_or(wasm_error("Could not find the newly updated User profile"))?;

  Ok(record)
}
