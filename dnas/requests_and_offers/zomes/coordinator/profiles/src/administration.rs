use std::str::FromStr;

use chrono::Duration;
use hdk::prelude::*;
use profiles_integrity::{status::Status, status::SuspendedStatus::*, LinkTypes};
use utils::wasm_error;

use crate::{external_calls::check_if_agent_is_administrator, profile::get_latest_profile};

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateInput {
    pub original_profile_hash: ActionHash,
    pub previous_profile_hash: ActionHash,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateStatusInput {
    pub original_profile_hash: ActionHash,
    pub previous_profile_hash: ActionHash,
    pub status: String,
}

#[hdk_extern]
pub fn update_person_status(input: UpdateStatusInput) -> ExternResult<Record> {
    if !check_if_agent_is_administrator(agent_info()?.agent_initial_pubkey)? {
        return Err(wasm_error(
            "Only administrators can update the status of a Person",
        ));
    }

    let mut profile = get_latest_profile(input.original_profile_hash.clone())?;
    profile.status = input.status;

    let profile_hash = update_entry(input.previous_profile_hash.clone(), profile)?;
    create_link(
        input.original_profile_hash.clone(),
        profile_hash.clone(),
        LinkTypes::ProfileUpdates,
        (),
    )?;

    let record = get(profile_hash.clone(), GetOptions::default())?
        .ok_or(wasm_error("Could not find the newly updated Profile"))?;

    Ok(record)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SuspendPersonInput {
    pub original_profile_hash: ActionHash,
    pub previous_profile_hash: ActionHash,
    pub duration_in_days: i64,
}

#[hdk_extern]
pub fn suspend_person_temporarily(input: SuspendPersonInput) -> ExternResult<bool> {
    let duration = Duration::days(input.duration_in_days);
    let mut suspended_status = Status::default();
    let now = &sys_time()?;
    suspended_status.suspend(Some((duration, now)))?;

    let update_status_input = UpdateStatusInput {
        original_profile_hash: input.original_profile_hash,
        previous_profile_hash: input.previous_profile_hash,
        status: suspended_status.to_string(),
    };

    Ok(update_person_status(update_status_input).is_ok())
}

#[hdk_extern]
pub fn suspend_person_indefinitely(input: UpdateInput) -> ExternResult<bool> {
    let update_status_input = UpdateStatusInput {
        original_profile_hash: input.original_profile_hash,
        previous_profile_hash: input.previous_profile_hash,
        status: "suspended".to_string(),
    };

    Ok(update_person_status(update_status_input).is_ok())
}

#[hdk_extern]
pub fn unsuspend_person_if_time_passed(input: UpdateInput) -> ExternResult<bool> {
    let profile = get_latest_profile(input.original_profile_hash.clone())?;

    let mut status =
        Status::from_str(profile.status.as_str()).map_err(|err| wasm_error(&err.to_string()))?;

    if let Status::Suspended(Temporarily(_)) = status {
        let now = sys_time()?;
        let is_unsuspended = status.unsuspend_if_time_passed(&now);

        if !is_unsuspended {
            return Ok(false);
        }

        let update_status_input = UpdateStatusInput {
            original_profile_hash: input.original_profile_hash,
            previous_profile_hash: input.previous_profile_hash,
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
        original_profile_hash: input.original_profile_hash,
        previous_profile_hash: input.previous_profile_hash,
        status: "accepted".to_string(),
    };

    Ok(update_person_status(update_status_input).is_ok())
}
