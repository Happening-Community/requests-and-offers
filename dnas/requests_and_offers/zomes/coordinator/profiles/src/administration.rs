use std::str::FromStr;

use chrono::Duration;
use hdk::prelude::*;
use profiles_integrity::{status::Status, status::SuspendedStatus::*, LinkTypes};
use utils::wasm_error;

use crate::{external_calls::check_if_agent_is_administrator, profile::get_latest_profile};

#[hdk_extern]
pub fn get_all_profiles(_: ()) -> ExternResult<Vec<Link>> {
    if !check_if_agent_is_administrator(agent_info()?.agent_initial_pubkey)? {
        return Err(wasm_error("Only administrators can retrieve all Profiles"));
    }

    let path = Path::from("all_profiles");
    get_links(path.path_entry_hash()?, LinkTypes::AllProfiles, None)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateInput {
    pub original_action_hash: ActionHash,
    pub previous_action_hash: ActionHash,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateStatusInput {
    pub original_action_hash: ActionHash,
    pub previous_action_hash: ActionHash,
    pub status: String,
}

#[hdk_extern]
pub fn update_person_status(input: UpdateStatusInput) -> ExternResult<Record> {
    if !check_if_agent_is_administrator(agent_info()?.agent_initial_pubkey)? {
        return Err(wasm_error(
            "Only administrators can update the status of a Person",
        ));
    }

    let mut profile = get_latest_profile(input.original_action_hash.clone())?;
    profile.status = input.status;

    let action_hash = update_entry(input.previous_action_hash.clone(), profile.clone())?;
    create_link(
        input.original_action_hash.clone(),
        action_hash.clone(),
        LinkTypes::ProfileUpdates,
        (),
    )?;

    let status = Status::from_str(&profile.status).map_err(|err| wasm_error(&err.to_string()))?;

    let path = Path::from("accepted_persons");
    let links = get_links(path.path_entry_hash()?, LinkTypes::AcceptedProfiles, None)?;
    let link = links
        .iter()
        .find(|link| link.target == input.original_action_hash.clone().into());

    if let Some(link) = link {
        delete_link(ActionHash::from(link.clone().create_link_hash))?;
    }

    if let Status::Accepted = status {
        create_link(
            path.path_entry_hash()?,
            input.original_action_hash,
            LinkTypes::AcceptedProfiles,
            (),
        )?;
    }

    let record = get(action_hash.clone(), GetOptions::default())?
        .ok_or(wasm_error("Could not find the newly updated Profile"))?;

    Ok(record)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SuspendPersonInput {
    pub original_action_hash: ActionHash,
    pub previous_action_hash: ActionHash,
    pub duration_in_days: i64,
}

#[hdk_extern]
pub fn suspend_person_temporarily(input: SuspendPersonInput) -> ExternResult<bool> {
    let duration = Duration::days(input.duration_in_days);
    let mut suspended_status = Status::default();
    let now = &sys_time()?;
    suspended_status.suspend(Some((duration, now)))?;

    let update_status_input = UpdateStatusInput {
        original_action_hash: input.original_action_hash,
        previous_action_hash: input.previous_action_hash,
        status: suspended_status.to_string(),
    };

    Ok(update_person_status(update_status_input).is_ok())
}

#[hdk_extern]
pub fn suspend_person_indefinitely(input: UpdateInput) -> ExternResult<bool> {
    let update_status_input = UpdateStatusInput {
        original_action_hash: input.original_action_hash,
        previous_action_hash: input.previous_action_hash,
        status: "suspended".to_string(),
    };

    Ok(update_person_status(update_status_input).is_ok())
}

#[hdk_extern]
pub fn unsuspend_person_if_time_passed(input: UpdateInput) -> ExternResult<bool> {
    let profile = get_latest_profile(input.original_action_hash.clone())?;

    let mut status =
        Status::from_str(profile.status.as_str()).map_err(|err| wasm_error(&err.to_string()))?;

    if let Status::Suspended(Temporarily(_)) = status {
        let now = sys_time()?;
        let is_unsuspended = status.unsuspend_if_time_passed(&now);

        if !is_unsuspended {
            return Ok(false);
        }

        let update_status_input = UpdateStatusInput {
            original_action_hash: input.original_action_hash,
            previous_action_hash: input.previous_action_hash,
            status: status.to_string(),
        };

        update_person_status(update_status_input)?;

        return Ok(true);
    }

    Ok(false)
}

#[hdk_extern]
pub fn unsuspend_person(input: UpdateInput) -> ExternResult<bool> {
    let update_status_input = UpdateStatusInput {
        original_action_hash: input.original_action_hash,
        previous_action_hash: input.previous_action_hash,
        status: "accepted".to_string(),
    };

    Ok(update_person_status(update_status_input).is_ok())
}
