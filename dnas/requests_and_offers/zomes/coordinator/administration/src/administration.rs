use administration_integrity::LinkTypes;
use hdk::prelude::*;
#[hdk_extern]
fn register_administrator(person_profile_hash: ActionHash) -> ExternResult<ValidateCallbackResult> {
    let path = Path::from("administrators");
    warn!("LinkTypes: {:?}", LinkTypes::AdministratorsPerson);
    create_link(
        path.path_entry_hash()?,
        person_profile_hash.clone(),
        LinkTypes::AdministratorsPerson,
        (),
    )?;
    Ok(ValidateCallbackResult::Valid)
}
