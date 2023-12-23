use hdk::prelude::*;
use profiles_integrity::*;

#[hdk_extern]
pub fn create_individual_profile(individual_profile: IndividualProfile) -> ExternResult<Record> {
    let mut individual_profile = individual_profile;
    individual_profile.created_at = sys_time()?;

    let individual_profile_hash =
        create_entry(&EntryTypes::IndividualProfile(individual_profile.clone()))?;
    let record = get(individual_profile_hash.clone(), GetOptions::default())?.ok_or(
        wasm_error!(WasmErrorInner::Guest(String::from(
            "Could not find the newly created IndividualProfile"
        ))),
    )?;

    let path = Path::from("all_individual_profiles");
    create_link(
        path.path_entry_hash()?,
        individual_profile_hash,
        LinkTypes::AllIndividualProfiles,
        (),
    )?;

    Ok(record)
}

#[hdk_extern]
pub fn get_individual_profile(
    original_individual_profile_hash: ActionHash,
) -> ExternResult<Option<Record>> {
    let links = get_links(
        original_individual_profile_hash.clone(),
        LinkTypes::IndividualProfileUpdates,
        None,
    )?;

    let latest_link = links
        .into_iter()
        .max_by(|link_a, link_b| link_a.timestamp.cmp(&link_b.timestamp));

    let latest_individual_profile_hash = match latest_link {
        Some(link) => ActionHash::from(link.target.clone()),
        None => original_individual_profile_hash.clone(),
    };

    get(latest_individual_profile_hash, GetOptions::default())
}

#[hdk_extern]
pub fn get_all_individual_profiles(_: ()) -> ExternResult<Vec<Record>> {
    let mut individual_profiles = Vec::new();
    let links = get_links(
        Path::from("all_individual_profiles").path_entry_hash()?,
        LinkTypes::AllIndividualProfiles,
        None,
    )?;

    for link in links {
        let individual_profile = get_individual_profile(ActionHash::from(link.target.clone()))?;
        if let Some(individual_profile) = individual_profile {
            individual_profiles.push(individual_profile)
        }
    }

    Ok(individual_profiles)
}

// #[hdk_extern]
// fn get_my_profile(_: ()) -> ExternResult<Record> {
//     let pubkey = agent_info()?.agent_initial_pubkey;
//     unimplemented!()
// }

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateIndividualProfileInput {
    pub original_individual_profile_hash: ActionHash,
    pub previous_individual_profile_hash: ActionHash,
    pub updated_individual_profile: IndividualProfile,
}

#[hdk_extern]
pub fn update_individual_profile(input: UpdateIndividualProfileInput) -> ExternResult<Record> {
    let updated_individual_profile_hash = update_entry(
        input.previous_individual_profile_hash.clone(),
        &input.updated_individual_profile,
    )?;

    create_link(
        input.original_individual_profile_hash.clone(),
        updated_individual_profile_hash.clone(),
        LinkTypes::IndividualProfileUpdates,
        (),
    )?;

    let record = get(
        updated_individual_profile_hash.clone(),
        GetOptions::default(),
    )?
    .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
        "Could not find the newly updated IndividualProfile"
    ))))?;

    Ok(record)
}

// #[hdk_extern]
// pub fn delete_individual_profile(
//     original_individual_profile_hash: ActionHash,
// ) -> ExternResult<ActionHash> {
//     delete_entry(original_individual_profile_hash)
// }
