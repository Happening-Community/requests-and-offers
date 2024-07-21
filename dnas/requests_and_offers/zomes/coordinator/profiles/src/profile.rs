use hdk::prelude::*;
use profiles_integrity::*;
use utils::wasm_error;

/// Represents the input for creating a new profile.
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

/// Creates a new profile for the agent.
///
/// ## Arguments
///
/// * `profile_input` - The profile data to be stored.
///
/// # Returns
///
/// This function returns a result containing the created profile record on success,
/// or an error if the agent already has a profile or if there was an issue creating the profile.
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

/// Retrieves the latest profile for the given original profile hash.
///
/// ## Arguments
///
/// * `original_profile_hash` - The action hash of the original profile.
///
/// ## Returns
///
/// This function returns a result containing an option of the latest profile record on success,
/// or an error if there was an issue retrieving the profile.
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

/// Gets the agent profile links for the specified agent public key.
///
/// ## Arguments
///
/// * `author` - The agent's public key.
///
/// ## Returns
///
/// This function returns a result containing a vector of links to the agent's profile records on success,
/// or an error if there was an issue retrieving the links.
#[hdk_extern]
pub fn get_agent_profile(author: AgentPubKey) -> ExternResult<Vec<Link>> {
    get_links(author, LinkTypes::MyProfile, None)
}

/// Retrieves the action hash of the agent's profile for the given agent public key.
///
/// ## Arguments
///
/// * `agent_pubkey` - The agent's public key.
///
/// ## Returns
///
/// This function returns a result containing an option of the action hash of the agent's profile on success,
/// or an error if there was an issue retrieving the hash.
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

/// Retrieves all profiles linked under the "all_profiles" path.
///
/// ## Arguments
///
/// * `_` - Unused parameter, required for consistency with HDK extern signature.
///
/// ## Returns
///
/// This function returns a result containing a vector of links to all profiles on success,
/// or an error if there was an issue retrieving the links.
#[hdk_extern]
pub fn get_all_profiles(_: ()) -> ExternResult<Vec<Link>> {
    let path = Path::from("all_profiles");
    get_links(path.path_entry_hash()?, LinkTypes::AllProfiles, None)
}

/// Input structure for updating a profile.
#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateProfileInput {
    /// The action hash of the original profile.
    pub original_profile_hash: ActionHash,
    /// The action hash of the previously updated profile.
    pub previous_profile_hash: ActionHash,
    /// The updated profile data.
    pub updated_profile: ProfileInput,
}

/// Updates an existing profile with new data.
///
/// # Arguments
///
/// * `input` - The input structure containing the hashes of the original and previous profiles,
///             and the updated profile data.
///
/// # Returns
///
/// This function returns a result containing the updated profile record on success,
/// or an error if there was an issue updating the profile, such as unauthorized access or invalid input
#[hdk_extern]
pub fn update_profile(input: UpdateProfileInput) -> ExternResult<Record> {
    let mut profile = Profile::from(input.updated_profile.clone());
    let last_record = must_get_valid_record(input.previous_profile_hash.clone())?;
    let original_record = must_get_valid_record(input.original_profile_hash.clone())?;

    let record_option: Option<Profile> = last_record
        .entry()
        .to_app_option()
        .map_err(|_| wasm_error("wasm_error while deserializing the previous Profile"))?;

    profile.status = record_option.unwrap().status;

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
