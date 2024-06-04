use hdk::prelude::*;
use profiles_integrity::*;

use crate::wasm_error;

#[hdk_extern]
pub fn create_profile(profile: Profile) -> ExternResult<Record> {
    let mut profile = profile;
    profile.status = Some("pending".to_string());

    let record = get_agent_profile(agent_info()?.agent_initial_pubkey)?;
    if !record.is_empty() {
        return Err(wasm_error("You already have a Profile"));
    }

    let profile_hash = create_entry(&EntryTypes::Profile(profile.clone()))?;
    let record = get(profile_hash.clone(), GetOptions::default())?
        .ok_or(wasm_error("Could not find the newly created Profile"))?;

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
            .ok_or(wasm_error("Could not find the latest Profile"))?,
        None => original_profile_hash.clone(),
    };
    get(latest_profile_hash, GetOptions::default())
}

#[hdk_extern]
pub fn get_agent_profile(author: AgentPubKey) -> ExternResult<Vec<Link>> {
    get_links(author, LinkTypes::MyProfile, None)
}

#[hdk_extern]
pub fn get_agent_profile_hash(agent_pubkey: AgentPubKey) -> ExternResult<Option<ActionHash>> {
    let agent_profile_links = get_agent_profile(agent_pubkey)?;

    if agent_profile_links.is_empty() {
        Ok(None)
    } else {
        Ok(Some(
            agent_profile_links[0]
                .target
                .clone()
                .into_action_hash()
                .ok_or(wasm_error("Could not find the agent profile hash"))?,
        ))
    }
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
    let mut input = input;

    let record = match get(input.previous_profile_hash.clone(), GetOptions::default())? {
        Some(record) => record,
        None => return Err(wasm_error("Could not find the previous Profile")),
    };

    if input.updated_profile.status.is_some() {
        return Err(wasm_error(
            "Only administrators can update the status of a Profile",
        ));
    }

    let record_option: Option<Profile> = record
        .entry()
        .to_app_option()
        .map_err(|_| wasm_error("wasm_error while deserializing the previous Profile"))?;
    input.updated_profile.status = record_option.unwrap().status;

    let author = record.action().author().clone();
    if author != agent_info()?.agent_initial_pubkey {
        return Err(wasm_error("Only the author of a Profile can update it"));
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
        .ok_or(wasm_error("Could not find the newly updated Profile"))?;

    Ok(record)
}
