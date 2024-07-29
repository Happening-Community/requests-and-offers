use hdk::prelude::*;
use profiles_integrity::*;
use utils::wasm_error;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProfileInput {
    pub name: String,
    pub nickname: String,
    pub bio: String,
    pub picture: Option<SerializedBytes>,
    pub user_type: String,
    pub skills: Vec<String>,
    pub email: String,
    pub phone: Option<String>,
    pub time_zone: String,
    pub location: String,
}

impl From<ProfileInput> for Profile {
    fn from(input: ProfileInput) -> Self {
        Profile {
            name: input.name.clone(),
            nickname: input.nickname.clone(),
            bio: input.bio.clone(),
            picture: input.picture.clone(),
            user_type: input.user_type.clone(),
            skills: input.skills.clone(),
            email: input.email.clone(),
            phone: input.phone.clone(),
            time_zone: input.time_zone.clone(),
            location: input.location.clone(),
            status: "pending".to_string(),
        }
    }
}

#[hdk_extern]
pub fn create_profile(profile_input: ProfileInput) -> ExternResult<Record> {
    let profile = Profile::from(profile_input);

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

    // if DnaProperties::get()?.progenitor_pubkey == agent_info()?.agent_initial_pubkey {}

    Ok(record)
}

#[hdk_extern]
pub fn get_latest_profile_record(
    original_profile_hash: ActionHash,
) -> ExternResult<Option<Record>> {
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
pub fn get_latest_profile(original_profile_hash: ActionHash) -> ExternResult<Profile> {
    let latest_profile_record = get_latest_profile_record(original_profile_hash)?;
    let latest_profile = latest_profile_record
        .ok_or(wasm_error("Could not find the latest Profile"))?
        .entry()
        .to_app_option()
        .map_err(|_| wasm_error("wasm_error while deserializing the latest Profile"))?
        .ok_or(wasm_error("Could not find the latest Profile"))?;
    Ok(latest_profile)
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
pub fn get_accepted_profiles(_: ()) -> ExternResult<Vec<Link>> {
    let path = Path::from("accepted_profiles");
    get_links(path.path_entry_hash()?, LinkTypes::AcceptedProfiles, None)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateProfileInput {
    pub original_profile_hash: ActionHash,
    pub previous_profile_hash: ActionHash,
    pub updated_profile: ProfileInput,
}

#[hdk_extern]
pub fn update_profile(input: UpdateProfileInput) -> ExternResult<Record> {
    let mut profile = Profile::from(input.updated_profile.clone());
    let original_record = must_get_valid_record(input.original_profile_hash.clone())?;

    let record_option = get_latest_profile(input.original_profile_hash.clone())?;
    profile.status = record_option.status;

    let author = original_record.action().author().clone();
    if author != agent_info()?.agent_initial_pubkey {
        return Err(wasm_error("Only the author of a Profile can update it"));
    }

    let updated_profile_hash = update_entry(input.previous_profile_hash.clone(), &profile)?;

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
