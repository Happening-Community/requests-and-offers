use std::str::FromStr;

use chrono::Duration;
use hdk::prelude::*;
use profiles_integrity::{status::Status, status::SuspendedStatus::*, LinkTypes};
use utils::wasm_error;

use crate::{external_calls::check_if_agent_is_administrator, profile::get_latest_profile};

/// Represents the base input for updating a profile.
#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateInput {
    pub original_profile_hash: ActionHash,
    pub previous_profile_hash: ActionHash,
}

/// Represents the input for updating the status of a profile.
#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateStatusInput {
    pub original_profile_hash: ActionHash,
    pub previous_profile_hash: ActionHash,
    pub status: String,
}

/// Updates the status of a person.
///
/// ## Arguments
///
/// * `input` - The input structure containing the hashes of the original and previous profiles,
///             and the updated status.
///
/// ## Returns
///
/// This function returns a result containing the updated profile record on success,
/// or an error if there was an issue updating the status, such as unauthorized access or invalid input
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

/// The input structure for suspending a person temporarily.
#[derive(Serialize, Deserialize, Debug)]
pub struct SuspendPersonInput {
    pub original_profile_hash: ActionHash,
    pub previous_profile_hash: ActionHash,
    pub duration_in_days: i64,
}

/// Suspends a person temporarily.
///
/// This function will update the status of a person to `Suspended(Temporarily(Timestamp))` where the `Timestamp` is the current time plus the given duration.
///
/// If the person is already suspended, this function will add the duration to the current suspension time.
///
/// ## Arguments
///
/// * `input` - The input structure containing the hashes of the original and previous profiles, and the duration in days to suspend the person for.
///
/// ## Returns
///
/// This function returns a result containing a boolean indicating whether the function was successful or not.
/// If the function was successful, the boolean will be `true`. If the function was not successful, the boolean will be `false`.
#[hdk_extern]
pub fn suspend_person_temporarily(input: SuspendPersonInput) -> ExternResult<bool> {
    let duration = Duration::days(input.duration_in_days);
    let suspended_status = Status::Suspended(Temporarily(Timestamp::from_micros(
        duration.num_microseconds().unwrap_or(0),
    )));

    Ok(update_person_status(UpdateStatusInput {
        original_profile_hash: input.original_profile_hash,
        previous_profile_hash: input.previous_profile_hash,
        status: suspended_status.to_string(),
    })
    .is_ok())
}

/// Suspends a person indefinitely.
///
/// This function will update the status of a person to `Suspended::Indefinitely`.
///
/// ## Arguments
///
/// * `input` - The input structure containing the hashes of the original and previous profiles.
///
/// ## Returns
///
/// This function returns a result containing a boolean indicating whether the function was successful or not.
/// If the function was successful, the boolean will be `true`. If the function was not successful, the boolean will be `false`.
#[hdk_extern]
pub fn suspended_person_indefinitely(input: UpdateInput) -> ExternResult<bool> {
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
        status.unsuspend_if_time_passed();

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
