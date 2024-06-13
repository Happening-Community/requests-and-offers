use crate::{profile::get_agent_profile_hash, wasm_error};
use hdk::prelude::*;
use profiles_integrity::{LinkTypes, Profile};

pub fn add_administrator(person_profile_hash: ActionHash) -> ExternResult<bool> {
    if check_if_person_is_administrator(person_profile_hash.clone())? {
        return Err(wasm_error("Allready an Administrator"));
    }

    register_administrator(person_profile_hash.clone())?;
    Ok(true)
}

#[hdk_extern]
pub fn register_administrator(person_profile_hash: ActionHash) -> ExternResult<bool> {
    let path = Path::from("administrators");
    create_link(
        path.path_entry_hash()?,
        person_profile_hash.clone(),
        LinkTypes::AllAdministrators,
        (),
    )?;
    Ok(true)
}

#[hdk_extern]
pub fn get_all_administrators_links(_: ()) -> ExternResult<Vec<Link>> {
    let path = Path::from("administrators");
    let links = get_links(path.path_entry_hash()?, LinkTypes::AllAdministrators, None)?;
    Ok(links)
}

#[hdk_extern]
pub fn check_if_person_is_administrator(person_profile_hash: ActionHash) -> ExternResult<bool> {
    let links = get_all_administrators_links(())?;
    if links
        .iter()
        .any(|link| link.target == person_profile_hash.clone().into())
    {
        return Ok(true);
    }
    Ok(false)
}

#[hdk_extern]
pub fn check_if_agent_is_administrator(agent_pubkey: AgentPubKey) -> ExternResult<bool> {
    let agent_person_profile_hash = get_agent_profile_hash(agent_pubkey)?;
    if let Some(agent_person_profile_hash) = agent_person_profile_hash {
        return Ok(check_if_person_is_administrator(agent_person_profile_hash)?);
    }

    Ok(false)
}

#[hdk_extern]
pub fn remove_administrator(person_profile_hash: ActionHash) -> ExternResult<bool> {
    if !check_if_agent_is_administrator(agent_info()?.agent_initial_pubkey)? {
        return Err(wasm_error("Only administrators can remove administrators"));
    }

    let administrators_links = get_all_administrators_links(())?;
    if administrators_links.len() == 1 {
        return Err(wasm_error("There must be at least one administrator"));
    }

    let links = get_all_administrators_links(())?;
    let link = links
        .iter()
        .find(|link| link.target == person_profile_hash.clone().into())
        .ok_or(wasm_error("Could not find the administrator link"))?;

    delete_link(link.create_link_hash.clone())?;
    Ok(true)
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
