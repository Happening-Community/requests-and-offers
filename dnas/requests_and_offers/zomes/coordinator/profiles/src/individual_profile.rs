use hdk::prelude::*;
use profiles_integrity::*;

use crate::{error, get_latest_link};

#[hdk_extern]
pub fn create_individual_profile(individual_profile: IndividualProfile) -> ExternResult<Record> {
    let mut individual_profile = individual_profile;
    individual_profile.created_at = sys_time()?;

    let individual_profile_hash =
        create_entry(&EntryTypes::IndividualProfile(individual_profile.clone()))?;
    let record = get(individual_profile_hash.clone(), GetOptions::default())?
        .ok_or(error("Could not find the newly created IndividualProfile"))?;

    let path = Path::from("all_individual_profiles");
    create_link(
        path.path_entry_hash()?,
        individual_profile_hash.clone(),
        LinkTypes::AllIndividualProfiles,
        (),
    )?;

    create_link(
        agent_info()?.agent_initial_pubkey,
        individual_profile_hash,
        LinkTypes::MyProfile,
        (),
    )?;

    Ok(record)
}

#[hdk_extern]
fn get_my_profile(_: ()) -> ExternResult<Option<Record>> {
    let pubkey = agent_info()?.agent_initial_pubkey;
    let profile_links = get_links(pubkey, LinkTypes::MyProfile, None)?;

    if profile_links.is_empty() {
        return Ok(None);
    }

    let profile_link = profile_links[0].clone();

    let update_links = get_links(
        profile_link.target.clone(),
        LinkTypes::IndividualProfileUpdates,
        None,
    )?;

    let latest_link = get_latest_link(update_links);

    match latest_link {
        Some(link) => get(ActionHash::from(link.target.clone()), GetOptions::default()),
        None => get(
            ActionHash::from(profile_link.target.clone()),
            GetOptions::default(),
        ),
    }
}

#[hdk_extern]
pub fn get_individual_profile(individual_profile_hash: ActionHash) -> ExternResult<Option<Record>> {
    let links = get_links(
        individual_profile_hash.clone(),
        LinkTypes::IndividualProfileUpdates,
        None,
    )?;

    let latest_link = get_latest_link(links);

    let latest_individual_profile_hash = match latest_link {
        Some(link) => ActionHash::from(link.target.clone()),
        None => individual_profile_hash.clone(),
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

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateIndividualProfileInput {
    pub individual_profile_hash: ActionHash,
    pub updated_individual_profile: IndividualProfile,
}

#[hdk_extern]
pub fn update_individual_profile(input: UpdateIndividualProfileInput) -> ExternResult<Record> {
    let individual_profile_hash = input.individual_profile_hash;
    let updated_individual_profile = input.updated_individual_profile;

    let record = match get(
        ActionHash::from(individual_profile_hash.clone()),
        GetOptions::default(),
    )? {
        Some(record) => record,
        None => return Err(error("Could not find the related IndividualProfile")),
    };

    let author = record.action().author();

    if *author != agent_info()?.agent_initial_pubkey {
        return Err(error("Can not update a profile of a different agent"));
    }

    let all_update_links = get_links(
        individual_profile_hash.clone(),
        LinkTypes::IndividualProfileUpdates,
        None,
    )?;

    let latest_link = get_latest_link(all_update_links);

    let previous_individual_profile_hash = match latest_link {
        Some(link) => Some(ActionHash::from(link.target.clone())),
        None => None,
    };

    let individual_profile_hash = if previous_individual_profile_hash.is_some() {
        previous_individual_profile_hash.unwrap()
    } else {
        individual_profile_hash.clone()
    };

    let updated_individual_profile_hash = update_entry(
        individual_profile_hash.clone(),
        &updated_individual_profile.clone(),
    )?;

    create_link(
        individual_profile_hash.clone(),
        updated_individual_profile_hash.clone(),
        LinkTypes::IndividualProfileUpdates,
        (),
    )?;

    let record = get(
        updated_individual_profile_hash.clone(),
        GetOptions::default(),
    )?
    .ok_or(error("Could not find the newly updated IndividualProfile"))?;

    Ok(record)
}
