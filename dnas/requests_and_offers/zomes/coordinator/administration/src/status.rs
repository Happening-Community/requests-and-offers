use administration_integrity::*;
use chrono::Duration;
use hdk::prelude::*;
use status::*;
use utils::get_all_revisions_for_entry;
use WasmErrorInner::*;

use crate::administration::check_if_agent_is_administrator;

#[derive(Serialize, Deserialize, Debug)]
pub struct StatusInput {
  pub entity_original_action_hash: ActionHash,
  pub entity: String,
}

#[hdk_extern]
pub fn create_status(input: StatusInput) -> ExternResult<Record> {
  let link = get_links(
    input.entity_original_action_hash.clone(),
    LinkTypes::EntityStatus,
    None,
  )?;

  if !link.is_empty() {
    return Err(wasm_error!(Guest("You already have a Status".to_string())));
  }

  let status_hash = create_entry(&EntryTypes::Status(Status::pending()))?;
  let record = get(status_hash.clone(), GetOptions::default())?.ok_or(wasm_error!(Guest(
    "Could not find the newly created profile's Status".to_string()
  )))?;

  let path = Path::from(format!("{}.status", input.entity));
  create_link(
    path.path_entry_hash()?,
    status_hash.clone(),
    LinkTypes::AllStatus,
    (),
  )?;

  create_link(
    input.entity_original_action_hash,
    status_hash,
    LinkTypes::EntityStatus,
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
pub fn get_latest_status_record_for_user(input: StatusInput) -> ExternResult<Option<Record>> {
  let link = get_links(
    input.entity_original_action_hash.clone(),
    LinkTypes::EntityStatus,
    None,
  )?;

  if !link.is_empty() {
    get_latest_status_record(
      link[0]
        .clone()
        .target
        .into_action_hash()
        .ok_or(wasm_error!(Guest(
          "Could not find the latest profile's Status action hash".to_string()
        )))?,
    )
  } else {
    Ok(None)
  }
}

#[hdk_extern]
pub fn get_latest_status_for_user(input: StatusInput) -> ExternResult<Option<Status>> {
  let link = get_links(
    input.entity_original_action_hash.clone(),
    LinkTypes::EntityStatus,
    None,
  )?;

  let latest_status: Option<Status> = if !link.is_empty() {
    get_latest_status(
      link[0]
        .target
        .clone()
        .into_action_hash()
        .ok_or(wasm_error!(Guest(
          "Could not find the latest profile's Status action hash".to_string()
        )))?,
    )?
  } else {
    None
  };

  Ok(latest_status)
}

pub fn create_accepted_entity_link(input: StatusInput) -> ExternResult<bool> {
  let path = Path::from(format!("{}.status.accepted", input.entity));
  create_link(
    path.path_entry_hash()?,
    input.entity_original_action_hash,
    LinkTypes::AcceptedUsers,
    (),
  )?;
  Ok(true)
}

pub fn delete_accepted_entity_link(input: StatusInput) -> ExternResult<bool> {
  let path = Path::from(format!("{}.status.accepted", input.entity));
  let links = get_links(path.path_entry_hash()?, LinkTypes::AcceptedUsers, None)?;
  let link = links
    .iter()
    .find(|link| link.target == input.entity_original_action_hash.clone().into());

  if let Some(link) = link {
    delete_link(ActionHash::from(link.clone().create_link_hash))?;
  }

  Ok(true)
}

#[hdk_extern]
pub fn get_accepted_entities(entity: String) -> ExternResult<Vec<Link>> {
  let path = Path::from(format!("{}.status.accepted", entity));
  get_links(path.path_entry_hash()?, LinkTypes::AcceptedUsers, None)
}

#[hdk_extern]
pub fn get_all_revisions_for_status(original_status_hash: ActionHash) -> ExternResult<Vec<Record>> {
  let records = get_all_revisions_for_entry(original_status_hash, LinkTypes::StatusUpdates)?;

  Ok(records)
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UpdateInput {
  pub entity: String,
  pub entity_original_action_hash: ActionHash,
  pub status_original_action_hash: ActionHash,
  pub status_previous_action_hash: ActionHash,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UpdateStatusInput {
  pub entity: String,
  pub entity_original_action_hash: ActionHash,
  pub status_original_action_hash: ActionHash,
  pub status_previous_action_hash: ActionHash,
  pub new_status: Status,
}

#[hdk_extern]
pub fn update_entity_status(input: UpdateStatusInput) -> ExternResult<Record> {
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

  delete_accepted_entity_link(StatusInput {
    entity_original_action_hash: input.entity_original_action_hash.clone(),
    entity: input.entity.clone(),
  })?;

  if input.new_status.status_type == "accepted" {
    create_accepted_entity_link(StatusInput {
      entity_original_action_hash: input.entity_original_action_hash,
      entity: input.entity,
    })?;
  }

  let record = get(action_hash.clone(), GetOptions::default())?.ok_or(wasm_error!(Guest(
    "Could not find the newly updated Status".to_string()
  )))?;

  Ok(record)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SuspendUserInput {
  pub entity: String,
  pub entity_original_action_hash: ActionHash,
  pub status_original_action_hash: ActionHash,
  pub status_previous_action_hash: ActionHash,
  pub reason: String,
  pub duration_in_days: Option<i64>,
}

#[hdk_extern]
pub fn suspend_entity_temporarily(input: SuspendUserInput) -> ExternResult<bool> {
  if input.duration_in_days.is_none() {
    return Err(wasm_error!(Guest(
      "Duration in days must be provided".to_string()
    )));
  }

  let duration = Duration::days(input.duration_in_days.unwrap());
  let now = &sys_time()?;

  let update_status_input = UpdateStatusInput {
    entity: input.entity,
    entity_original_action_hash: input.entity_original_action_hash,
    status_original_action_hash: input.status_original_action_hash,
    status_previous_action_hash: input.status_previous_action_hash,
    new_status: Status::suspend(input.reason.as_str(), Some((duration, now))),
  };

  Ok(update_entity_status(update_status_input).is_ok())
}

#[hdk_extern]
pub fn suspend_entity_indefinitely(input: SuspendUserInput) -> ExternResult<bool> {
  let update_status_input = UpdateStatusInput {
    entity: input.entity,
    entity_original_action_hash: input.entity_original_action_hash,
    status_original_action_hash: input.status_original_action_hash,
    status_previous_action_hash: input.status_previous_action_hash,
    new_status: Status::suspend(input.reason.as_str(), None),
  };

  Ok(update_entity_status(update_status_input).is_ok())
}

#[hdk_extern]
pub fn unsuspend_entity_if_time_passed(input: UpdateInput) -> ExternResult<bool> {
  let link = get_links(
    input.entity_original_action_hash.clone(),
    LinkTypes::EntityStatus,
    None,
  )?;

  let link = match link.first() {
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

  let mut status = get_latest_status(status_action_hash)?.ok_or(wasm_error!(Guest(
    "Could not find the latest user Status".to_string()
  )))?;

  if status.status_type == "suspended temporarily" {
    let now = sys_time()?;
    let is_unsuspended = status.unsuspend_if_time_passed(&now);

    if !is_unsuspended {
      return Ok(false);
    }

    let update_status_input = UpdateStatusInput {
      entity: input.entity,
      entity_original_action_hash: input.entity_original_action_hash,
      status_original_action_hash: input.status_original_action_hash,
      status_previous_action_hash: input.status_previous_action_hash,
      new_status: status,
    };

    warn!("Status input: {:?}", update_status_input.new_status);

    update_entity_status(update_status_input)?;

    return Ok(true);
  }

  Ok(false)
}

#[hdk_extern]
pub fn unsuspend_user(input: UpdateInput) -> ExternResult<bool> {
  let update_status_input = UpdateStatusInput {
    entity: input.entity,
    entity_original_action_hash: input.entity_original_action_hash,
    status_original_action_hash: input.status_original_action_hash,
    status_previous_action_hash: input.status_previous_action_hash,
    new_status: Status::accept(),
  };

  Ok(update_entity_status(update_status_input).is_ok())
}
