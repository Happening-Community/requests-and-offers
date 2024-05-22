use administration_integrity::LinkTypes;
use hdk::prelude::*;

use crate::wasm_error;

#[hdk_extern]
fn register_administrator(person_profile_hash: ActionHash) -> ExternResult<bool> {
    let path = Path::from("administrators");
    warn!("LinkTypes: {:?}", LinkTypes::AdministratorsPerson);
    create_link(
        path.path_entry_hash()?,
        person_profile_hash.clone(),
        LinkTypes::AdministratorsPerson,
        (),
    )?;
    Ok(true)
}

#[hdk_extern]
fn get_all_administrators_links(_: ()) -> ExternResult<Vec<Link>> {
    let path = Path::from("administrators");
    let links = get_links(
        path.path_entry_hash()?,
        LinkTypes::AdministratorsPerson,
        None,
    )?;
    Ok(links)
}

#[hdk_extern]
fn check_if_administrator(person_profile_hash: ActionHash) -> ExternResult<bool> {
    let links = get_all_administrators_links(())?;
    if links
        .iter()
        .any(|link| link.target == person_profile_hash.clone().into())
    {
        return Ok(true);
    }
    Err(wasm_error("Not an administrator".into()))
}
