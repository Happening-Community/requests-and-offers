use crate::{external_calls::check_if_agent_is_administrator, wasm_error};
use hdk::prelude::*;
use profiles_integrity::{LinkTypes, Profile};

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

    let record = match get(input.previous_profile_hash.clone(), GetOptions::default())? {
        Some(record) => record,
        None => return Err(wasm_error("Could not find the previous Profile")),
    };

    let mut updated_profile: Profile = record
        .entry()
        .to_app_option()
        .map_err(|_| wasm_error("wasm_error while deserializing the previous Profile"))?
        .ok_or(wasm_error("Could not find the previous Profile"))?;
    updated_profile.status = Some(input.status);

    let updated_profile_hash = update_entry(input.previous_profile_hash.clone(), updated_profile)?;
    create_link(
        input.original_profile_hash.clone(),
        updated_profile_hash.clone(),
        LinkTypes::ProfileUpdates,
        (),
    )?;

    let record = get(updated_profile_hash.clone(), GetOptions::default())?
        .ok_or(wasm_error("Could not find the newly updated Profile"))?;

    Ok(record)
}
