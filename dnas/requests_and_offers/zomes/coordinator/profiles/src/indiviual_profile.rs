use hdk::prelude::*;
use profiles_integrity::*;
#[hdk_extern]
pub fn create_indiviual_profile(indiviual_profile: IndiviualProfile) -> ExternResult<Record> {
    let indiviual_profile_hash =
        create_entry(&EntryTypes::IndiviualProfile(indiviual_profile.clone()))?;
    let record = get(indiviual_profile_hash.clone(), GetOptions::default())?.ok_or(wasm_error!(
        WasmErrorInner::Guest(String::from(
            "Could not find the newly created IndiviualProfile"
        ))
    ))?;
    Ok(record)
}
#[hdk_extern]
pub fn get_indiviual_profile(
    original_indiviual_profile_hash: ActionHash,
) -> ExternResult<Option<Record>> {
    let links = get_links(
        original_indiviual_profile_hash.clone(),
        LinkTypes::IndiviualProfileUpdates,
        None,
    )?;
    let latest_link = links
        .into_iter()
        .max_by(|link_a, link_b| link_a.timestamp.cmp(&link_b.timestamp));
    let latest_indiviual_profile_hash = match latest_link {
        Some(link) => ActionHash::from(link.target.clone()),
        None => original_indiviual_profile_hash.clone(),
    };
    get(latest_indiviual_profile_hash, GetOptions::default())
}
#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateIndiviualProfileInput {
    pub original_indiviual_profile_hash: ActionHash,
    pub previous_indiviual_profile_hash: ActionHash,
    pub updated_indiviual_profile: IndiviualProfile,
}
#[hdk_extern]
pub fn update_indiviual_profile(input: UpdateIndiviualProfileInput) -> ExternResult<Record> {
    let updated_indiviual_profile_hash = update_entry(
        input.previous_indiviual_profile_hash.clone(),
        &input.updated_indiviual_profile,
    )?;
    create_link(
        input.original_indiviual_profile_hash.clone(),
        updated_indiviual_profile_hash.clone(),
        LinkTypes::IndiviualProfileUpdates,
        (),
    )?;
    let record = get(
        updated_indiviual_profile_hash.clone(),
        GetOptions::default(),
    )?
    .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
        "Could not find the newly updated IndiviualProfile"
    ))))?;
    Ok(record)
}
#[hdk_extern]
pub fn delete_indiviual_profile(
    original_indiviual_profile_hash: ActionHash,
) -> ExternResult<ActionHash> {
    delete_entry(original_indiviual_profile_hash)
}
