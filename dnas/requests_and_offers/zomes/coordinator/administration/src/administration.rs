use crate::wasm_error;
use administration_integrity::LinkTypes as AdministrationLinkTypes;
use hdk::prelude::*;
use profiles_integrity::LinkTypes as ProfileLinkTypes;

#[hdk_extern]
fn register_administrator(person_profile_hash: ActionHash) -> ExternResult<bool> {
    let path = Path::from("administrators");
    create_link(
        path.path_entry_hash()?,
        person_profile_hash.clone(),
        AdministrationLinkTypes::AdministratorsPerson,
        (),
    )?;
    Ok(true)
}

#[hdk_extern]
fn get_all_administrators_links(_: ()) -> ExternResult<Vec<Link>> {
    let path = Path::from("administrators");
    let links = get_links(
        path.path_entry_hash()?,
        AdministrationLinkTypes::AdministratorsPerson,
        None,
    )?;
    Ok(links)
}

#[hdk_extern]
fn check_if_person_is_administrator(person_profile_hash: ActionHash) -> ExternResult<bool> {
    let links = get_all_administrators_links(())?;
    if links
        .iter()
        .any(|link| link.target == person_profile_hash.clone().into())
    {
        return Ok(true);
    }
    Err(wasm_error("Not an administrator".into()))
}

#[hdk_extern]
fn check_if_agent_is_administrator(agent_pubkey: AgentPubKey) -> ExternResult<bool> {
    let links = get_links(agent_pubkey, ProfileLinkTypes::MyProfile, None)?;
    let my_profile_link = links
        .first()
        .ok_or_else(|| wasm_error("Person profile not found".into()))?;

    let my_profile_hash = my_profile_link
        .target
        .clone()
        .into_action_hash()
        .ok_or(wasm_error("Error ".into()))?;

    let links = get_all_administrators_links(())?;
    if links
        .iter()
        .any(|link| link.target == my_profile_hash.clone().into())
    {
        return Ok(true);
    }
    Err(wasm_error("Not an administrator".into()))
}

#[hdk_extern]
fn remove_administrator(person_profile_hash: ActionHash) -> ExternResult<bool> {
    delete_link(person_profile_hash.clone())?;
    Ok(true)
}
