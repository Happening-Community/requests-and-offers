use hdk::prelude::*;
use profiles_integrity::*;

use crate::{error, get_latest_link};

/// Creates a new profile entry in the DHT.
///
/// This function takes a `Profile` struct as input, sets the creation timestamp,
/// and stores it in the DHT. It also creates links to the profile under the "all_profiles"
/// path and under the agent's public key.
///
/// # Arguments
///
/// * `profile` - The `Profile` struct representing the individual profile to be created.
///
/// # Returns
///
/// * `ExternResult<Record>` - A result containing the record of the newly created individual profile.
///
/// # Errors
///
/// This function will return an error if there is a problem creating the entry, linking it,
/// or if the entry already exists.
#[hdk_extern]
pub fn create_profile(profile: Profile) -> ExternResult<Record> {
    let profile_hash = create_entry(&EntryTypes::Profile(profile.clone()))?;
    let record = get(profile_hash.clone(), GetOptions::default())?
        .ok_or(error("Could not find the newly created Profile"))?;

    let path = Path::from("all_profiles");
    create_link(
        path.path_entry_hash()?,
        profile_hash.clone(),
        LinkTypes::AllProfiles,
        (),
    )?;

    create_link(
        agent_info()?.agent_initial_pubkey,
        profile_hash,
        LinkTypes::MyProfile,
        (),
    )?;

    Ok(record)
}

/// Retrieves the current agent's individual profile from the DHT.
///
/// This function retrieves the profile linked to the current agent's public key.
/// It also attempts to retrieve the latest update to the profile.
///
/// # Arguments
///
/// * `()` - No arguments are required for this function.
///
/// # Returns
///
/// * `ExternResult<Option<Record>>` - A result containing an optional record of the agent's individual profile.
///
/// # Errors
///
/// This function will return an error if there is a problem retrieving the profile or its updates.
#[hdk_extern]
fn get_my_profile(_: ()) -> ExternResult<Option<Record>> {
    let pubkey = agent_info()?.agent_initial_pubkey;
    let profile_links = get_links(pubkey, LinkTypes::MyProfile, None)?;

    if profile_links.is_empty() {
        return Ok(None);
    }

    let profile_link = profile_links[0].clone();

    let update_links = get_links(profile_link.target.clone(), LinkTypes::ProfileUpdates, None)?;

    warn!("update_links {:#?}", update_links);

    let latest_link = get_latest_link(update_links);

    match latest_link {
        Some(link) => get(
            link.target.into_action_hash().unwrap(),
            GetOptions::default(),
        ),
        None => get(
            profile_link.target.into_action_hash().unwrap(),
            GetOptions::default(),
        ),
    }
}

/// Retrieves an individual profile from the DHT using its action hash.
///
/// This function retrieves a profile by its action hash. It also attempts to retrieve
/// the latest update to the profile.
///
/// # Arguments
///
/// * `profile_hash` - The `ActionHash` of the individual profile to retrieve.
///
/// # Returns
///
/// * `ExternResult<Option<Record>>` - A result containing an optional record of the retrieved individual profile.
///
/// # Errors
///
/// This function will return an error if there is a problem retrieving the profile or its updates.
#[hdk_extern]
pub fn get_profile(profile_hash: ActionHash) -> ExternResult<Option<Record>> {
    let links = get_links(profile_hash.clone(), LinkTypes::ProfileUpdates, None)?;

    let latest_link = get_latest_link(links);

    let latest_profile_hash = match latest_link {
        Some(link) => link.target.clone().into_action_hash().unwrap(),
        None => profile_hash.clone(),
    };

    get(latest_profile_hash, GetOptions::default())
}

/// Retrieves all individual profiles from the DHT.
///
/// This function retrieves all profiles linked under the "all_profiles" path.
///
/// # Arguments
///
/// * `()` - No arguments are required for this function.
///
/// # Returns
///
/// * `ExternResult<Vec<Record>>` - A result containing a vector of records of all individual profiles.
///
/// # Errors
///
/// This function will return an error if there is a problem retrieving the profiles or their links.
#[hdk_extern]
pub fn get_all_profiles(_: ()) -> ExternResult<Vec<Record>> {
    let mut profiles = Vec::new();
    let links = get_links(
        Path::from("all_profiles").path_entry_hash()?,
        LinkTypes::AllProfiles,
        None,
    )?;

    for link in links {
        let profile = get_profile(link.target.clone().into_action_hash().unwrap())?;
        if let Some(profile) = profile {
            profiles.push(profile)
        }
    }

    Ok(profiles)
}

/// Input structure for updating an individual profile.
///
/// Contains the hash of the existing profile and the new profile data.
#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateProfileInput {
    pub profile_hash: ActionHash,
    pub updated_profile: Profile,
}

/// Updates an individual profile in the DHT.
///
/// This function updates the profile linked to the current agent's public key.
/// It creates a new entry for the updated profile and links it to the previous version.
///
/// # Arguments
///
/// * `updated_profile` - The `Profile` struct containing the new profile data.
///
/// # Returns
///
/// * `ExternResult<Record>` - A result containing the record of the updated individual profile.
///
/// # Errors
///
/// This function will return an error if there is a problem updating the profile, such as attempting to update another agent's profile or if the profile does not exist.
#[hdk_extern]
pub fn update_my_profile(input: UpdateProfileInput) -> ExternResult<Record> {
    let profile_hash = input.profile_hash;

    let record = match get(profile_hash.clone().into_hash(), GetOptions::default())? {
        Some(record) => record,
        None => return Err(error("Could not find the related Profile")),
    };

    let author = record.action().author().to_owned();

    if author != agent_info()?.agent_initial_pubkey {
        return Err(error("Can not update a profile of a different agent"));
    }

    let all_update_links = get_links(profile_hash.clone(), LinkTypes::ProfileUpdates, None)?;

    let latest_link = get_latest_link(all_update_links);

    let previous_profile_hash = match latest_link {
        Some(link) => Some(link.target.clone().into_action_hash().unwrap()),
        None => None,
    };

    let profile_hash = if previous_profile_hash.is_some() {
        previous_profile_hash.unwrap()
    } else {
        profile_hash.clone()
    };

    let updated_profile_hash = update_entry(profile_hash.clone(), input.updated_profile.clone())?;

    create_link(
        profile_hash.clone(),
        updated_profile_hash.clone(),
        LinkTypes::ProfileUpdates,
        (),
    )?;

    let record = get(updated_profile_hash.clone(), GetOptions::default())?
        .ok_or(error("Could not find the newly updated Profile"))?;

    Ok(record)
}
