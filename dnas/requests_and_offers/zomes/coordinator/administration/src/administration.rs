use crate::wasm_error;
use administration_integrity::LinkTypes;
use hdk::prelude::*;

#[hdk_extern]
fn register_administrator(person_profile_hash: ActionHash) -> ExternResult<bool> {
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
fn get_all_administrators_links(_: ()) -> ExternResult<Vec<Link>> {
    let path = Path::from("administrators");
    let links = get_links(path.path_entry_hash()?, LinkTypes::AllAdministrators, None)?;
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
fn remove_administrator(person_profile_hash: ActionHash) -> ExternResult<bool> {
    delete_link(person_profile_hash.clone())?;
    Ok(true)
}
