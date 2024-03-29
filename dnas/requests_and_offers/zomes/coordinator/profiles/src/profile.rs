use hdk::prelude::*;
use profiles_integrity::*;

use crate::error;

#[hdk_extern]
pub fn create_profile(profile: Profile) -> ExternResult<Record> {
    let record = get_agent_profile(agent_info()?.agent_initial_pubkey)?;
    if !record.is_empty() {
        return Err(error("You already have a Profile"));
    }

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

#[hdk_extern]
pub fn get_latest_profile(original_profile_hash: ActionHash) -> ExternResult<Option<Record>> {
    let links = get_links(
        original_profile_hash.clone(),
        LinkTypes::ProfileUpdates,
        None,
    )?;
    let latest_link = links
        .into_iter()
        .max_by(|link_a, link_b| link_a.timestamp.cmp(&link_b.timestamp));
    let latest_profile_hash = match latest_link {
        Some(link) => link
            .target
            .clone()
            .into_action_hash()
            .ok_or(error("Could not find the latest Profile"))?,
        None => original_profile_hash.clone(),
    };
    get(latest_profile_hash, GetOptions::default())
}

#[hdk_extern]
pub fn get_agent_profile(author: AgentPubKey) -> ExternResult<Vec<Link>> {
    get_links(author, LinkTypes::MyProfile, None)
}

#[hdk_extern]
pub fn get_all_profiles(_: ()) -> ExternResult<Vec<Link>> {
    let path = Path::from("all_profiles");
    get_links(path.path_entry_hash()?, LinkTypes::AllProfiles, None)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateProfileInput {
    pub original_profile_hash: ActionHash,
    pub previous_profile_hash: ActionHash,
    pub updated_profile: Profile,
}

#[hdk_extern]
pub fn update_profile(input: UpdateProfileInput) -> ExternResult<Record> {
    let record = match get(input.previous_profile_hash.clone(), GetOptions::default())? {
        Some(record) => record,
        None => return Err(error("Could not find the previous Profile")),
    };

    let author = record.action().author().clone();
    if author != agent_info()?.agent_initial_pubkey {
        return Err(error("Only the author of a Profile can update it"));
    }

    let updated_profile_hash =
        update_entry(input.previous_profile_hash.clone(), &input.updated_profile)?;

    create_link(
        input.original_profile_hash.clone(),
        updated_profile_hash.clone(),
        LinkTypes::ProfileUpdates,
        (),
    )?;

    let record = get(updated_profile_hash.clone(), GetOptions::default())?
        .ok_or(error("Could not find the newly updated Profile"))?;

    Ok(record)
}
