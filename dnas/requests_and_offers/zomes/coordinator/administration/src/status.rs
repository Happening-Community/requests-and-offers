use crate::{
  administration::check_if_agent_is_administrator, external_calls::get_profile_status_link,
};
use administration_integrity::*;
use chrono::Duration;
use hdk::prelude::*;
use status::*;
use std::str::FromStr;
use SuspendedStatus::*;
use WasmErrorInner::*;

#[hdk_extern]
pub fn create_status(user_original_action_hash: ActionHash) -> ExternResult<Record> {
  let link = get_profile_status_link(user_original_action_hash)?;

  if link.is_some() {
    return Err(wasm_error!(Guest("You already have a Status".to_string())));
  }

  let status_hash = create_entry(&EntryTypes::Status(Status::default()))?;
  let record = get(status_hash.clone(), GetOptions::default())?.ok_or(wasm_error!(Guest(
    "Could not find the newly created profile's Status".to_string()
  )))?;

  let path = Path::from("all_status");
  create_link(
    path.path_entry_hash()?,
    status_hash.clone(),
    LinkTypes::AllStatus,
    (),
  )?;

  Ok(record)
}

#[hdk_extern]
pub fn get_latest_status_record(original_action_hash: ActionHash) -> ExternResult<Option<Record>> {
  let links = get_links(original_action_hash.clone(), LinkTypes::StatusUpdates, None)?;
  let latest_link = links
    .into_iter()
    .max_by(|link_a, link_b| link_a.timestamp.cmp(&link_b.timestamp));
  let latest_status_hash = match latest_link {
    Some(link) => link
      .target
      .clone()
      .into_action_hash()
      .ok_or(wasm_error!(Guest(
        "Could not find the latest profile's Status".to_string()
      )))?,
    None => original_action_hash.clone(),
  };
  get(latest_status_hash, GetOptions::default())
}

#[hdk_extern]
pub fn get_latest_status(original_action_hash: ActionHash) -> ExternResult<Option<Status>> {
  let latest_status_record = get_latest_status_record(original_action_hash)?;
  let latest_status_option: Option<Status> = latest_status_record
    .ok_or(wasm_error!(Guest(
      "Could not find the latest profile's Status".to_string()
    )))?
    .entry()
    .to_app_option()
    .map_err(|_| {
      wasm_error!(Guest(
        "wasm_error! Guest(while deserializing the latest profile's Status".to_string()
      ))
    })?;

  Ok(latest_status_option)
}

#[hdk_extern]
pub fn get_latest_status_record_for_user(
  user_original_action_hash: ActionHash,
) -> ExternResult<Option<Record>> {
  let link = get_profile_status_link(user_original_action_hash)?;

  if let Some(link) = link {
    get_latest_status_record(link.target.into_action_hash().ok_or(wasm_error!(Guest(
      "Could not find the latest profile's Status action hash".to_string()
    )))?)
  } else {
    Ok(None)
  }
}

#[hdk_extern]
pub fn get_latest_status_for_user(
  user_original_action_hash: ActionHash,
) -> ExternResult<Option<Status>> {
  let link = get_profile_status_link(user_original_action_hash)?;

  let latest_status: Option<Status> = if let Some(link) = link {
    get_latest_status(link.target.into_action_hash().ok_or(wasm_error!(Guest(
      "Could not find the latest profile's Status action hash".to_string()
    )))?)?
  } else {
    None
  };

  Ok(latest_status)
}

#[hdk_extern]
pub fn create_accepted_user_link(original_action_hash: ActionHash) -> ExternResult<bool> {
  let path = Path::from("accepted_users");
  create_link(
    path.path_entry_hash()?,
    original_action_hash,
    LinkTypes::AcceptedUsers,
    (),
  )?;
  Ok(true)
}

#[hdk_extern]
pub fn delete_accepted_user_link(original_action_hash: ActionHash) -> ExternResult<bool> {
  let path = Path::from("accepted_users");
  let links = get_links(path.path_entry_hash()?, LinkTypes::AcceptedUsers, None)?;
  let link = links
    .iter()
    .find(|link| link.target == original_action_hash.clone().into());

  if let Some(link) = link {
    delete_link(ActionHash::from(link.clone().create_link_hash))?;
  }

  Ok(true)
}

#[hdk_extern]
pub fn get_accepted_users(_: ()) -> ExternResult<Vec<Link>> {
  let path = Path::from("accepted_users");
  get_links(path.path_entry_hash()?, LinkTypes::AcceptedUsers, None)
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UpdateInput {
  pub user_original_action_hash: ActionHash,
  pub status_original_action_hash: ActionHash,
  pub status_previous_action_hash: ActionHash,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UpdateStatusInput {
  pub user_original_action_hash: ActionHash,
  pub status_original_action_hash: ActionHash,
  pub status_previous_action_hash: ActionHash,
  pub new_status: Status,
}

#[hdk_extern]
pub fn update_user_status(input: UpdateStatusInput) -> ExternResult<Record> {
  if !check_if_agent_is_administrator(agent_info()?.agent_initial_pubkey)? {
    return Err(wasm_error!(Guest(
      "Only administrators can update the Status of a User".to_string()
    )));
  }

  let action_hash: HoloHash<holo_hash::hash_type::Action> = update_entry(
    input.status_previous_action_hash.clone(),
    input.new_status.clone(),
  )?;
  create_link(
    input.status_original_action_hash.clone(),
    action_hash.clone(),
    LinkTypes::StatusUpdates,
    (),
  )?;

  let status =
    StatusList::from_str(&input.new_status.0).map_err(|err| wasm_error!(Guest(err.to_string())))?;

  delete_accepted_user_link(input.user_original_action_hash.clone())?;

  if let StatusList::Accepted = status {
    create_accepted_user_link(input.user_original_action_hash.clone())?;
  }

  let record = get(action_hash.clone(), GetOptions::default())?.ok_or(wasm_error!(Guest(
    "Could not find the newly updated Status".to_string()
  )))?;

  Ok(record)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SuspendUserInput {
  pub user_original_action_hash: ActionHash,
  pub status_original_action_hash: ActionHash,
  pub status_previous_action_hash: ActionHash,
  pub duration_in_days: i64,
}

#[hdk_extern]
pub fn suspend_user_temporarily(input: SuspendUserInput) -> ExternResult<bool> {
  let duration = Duration::days(input.duration_in_days);
  let mut suspended_status = StatusList::default();
  let now = &sys_time()?;
  suspended_status.suspend(Some((duration, now)))?;

  let update_status_input = UpdateStatusInput {
    user_original_action_hash: input.user_original_action_hash,
    status_original_action_hash: input.status_original_action_hash,
    status_previous_action_hash: input.status_previous_action_hash,
    new_status: Status::from(suspended_status),
  };

  Ok(update_user_status(update_status_input).is_ok())
}

#[hdk_extern]
pub fn suspend_user_indefinitely(input: UpdateInput) -> ExternResult<bool> {
  let update_status_input = UpdateStatusInput {
    user_original_action_hash: input.user_original_action_hash,
    status_original_action_hash: input.status_original_action_hash,
    status_previous_action_hash: input.status_previous_action_hash,
    new_status: Status("suspended".to_string()),
  };

  Ok(update_user_status(update_status_input).is_ok())
}

#[hdk_extern]
pub fn unsuspend_user_if_time_passed(input: UpdateInput) -> ExternResult<bool> {
  let link = match get_profile_status_link(input.user_original_action_hash.clone())? {
    Some(link) => link,
    None => {
      return Err(wasm_error!(Guest(
        "Could not find the user's Status link".to_string()
      )))
    }
  };

  let status_action_hash = link
    .clone()
    .target
    .into_action_hash()
    .ok_or(wasm_error!(Guest(
      "Could not find the user action hash".to_string()
    )))?;

  let mut status = get_latest_status(status_action_hash)?
    .ok_or(wasm_error!(Guest(
      "Could not find the latest user Status".to_string()
    )))?
    .to_status_list();

  if let StatusList::Suspended(Temporarily(_)) = status {
    let now = sys_time()?;
    let is_unsuspended = status.unsuspend_if_time_passed(&now);

    if !is_unsuspended {
      return Ok(false);
    }

    let update_status_input = UpdateStatusInput {
      user_original_action_hash: input.user_original_action_hash,
      status_original_action_hash: input.status_original_action_hash,
      status_previous_action_hash: input.status_previous_action_hash,
      new_status: Status::from(status),
    };

    update_user_status(update_status_input)?;

    return Ok(true);
  }

  Ok(false)
}

#[hdk_extern]
pub fn unsuspend_user(input: UpdateInput) -> ExternResult<bool> {
  let update_status_input = UpdateStatusInput {
    user_original_action_hash: input.user_original_action_hash,
    status_original_action_hash: input.status_original_action_hash,
    status_previous_action_hash: input.status_previous_action_hash,
    new_status: Status("accepted".to_string()),
  };

  Ok(update_user_status(update_status_input).is_ok())
}
