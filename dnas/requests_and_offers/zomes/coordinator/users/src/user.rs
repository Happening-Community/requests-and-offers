use hdk::prelude::*;
use users_integrity::*;
use utils::wasm_error;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UserInput {
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

impl From<UserInput> for User {
  fn from(input: UserInput) -> Self {
    User {
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
pub fn create_user(user_input: UserInput) -> ExternResult<Record> {
  let user = User::from(user_input);

  let record = get_agent_user(agent_info()?.agent_initial_pubkey)?;
  if !record.is_empty() {
    return Err(wasm_error("You already have a User profile"));
  }

  let user_hash = create_entry(&EntryTypes::User(user.clone()))?;
  let record = get(user_hash.clone(), GetOptions::default())?
    .ok_or(wasm_error("Could not find the newly created User profile"))?;

  let path = Path::from("all_users");
  create_link(
    path.path_entry_hash()?,
    user_hash.clone(),
    LinkTypes::AllUsers,
    (),
  )?;

  create_link(
    agent_info()?.agent_initial_pubkey,
    user_hash,
    LinkTypes::MyUser,
    (),
  )?;

  Ok(record)
}

#[hdk_extern]
pub fn get_latest_user_record(original_action_hash: ActionHash) -> ExternResult<Option<Record>> {
  let links = get_links(original_action_hash.clone(), LinkTypes::UserUpdates, None)?;
  let latest_link = links
    .into_iter()
    .max_by(|link_a, link_b| link_a.timestamp.cmp(&link_b.timestamp));
  let latest_user_hash = match latest_link {
    Some(link) => link
      .target
      .clone()
      .into_action_hash()
      .ok_or(wasm_error("Could not find the latest User profile"))?,
    None => original_action_hash.clone(),
  };
  get(latest_user_hash, GetOptions::default())
}

#[hdk_extern]
pub fn get_latest_user(original_action_hash: ActionHash) -> ExternResult<User> {
  let latest_user_record = get_latest_user_record(original_action_hash)?;
  let latest_user = latest_user_record
    .ok_or(wasm_error("Could not find the latest User profile"))?
    .entry()
    .to_app_option()
    .map_err(|_| wasm_error("wasm_error while deserializing the latest User profile"))?
    .ok_or(wasm_error("Could not find the latest User profile"))?;
  Ok(latest_user)
}

#[hdk_extern]
pub fn get_agent_user(author: AgentPubKey) -> ExternResult<Vec<Link>> {
  get_links(author, LinkTypes::MyUser, None)
}

#[hdk_extern]
pub fn get_agent_user_hash(agent_pubkey: AgentPubKey) -> ExternResult<Option<ActionHash>> {
  let agent_user_links = get_agent_user(agent_pubkey)?;

  if agent_user_links.is_empty() {
    Ok(None)
  } else {
    Ok(Some(
      agent_user_links[0]
        .target
        .clone()
        .into_action_hash()
        .ok_or(wasm_error("Could not find the agent User profile hash"))?,
    ))
  }
}

#[hdk_extern]
pub fn get_accepted_users(_: ()) -> ExternResult<Vec<Link>> {
  let path = Path::from("accepted_users");
  get_links(path.path_entry_hash()?, LinkTypes::AcceptedUsers, None)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateUserInput {
  pub original_action_hash: ActionHash,
  pub previous_action_hash: ActionHash,
  pub updated_user: UserInput,
}

#[hdk_extern]
pub fn update_user(input: UpdateUserInput) -> ExternResult<Record> {
  let mut user = User::from(input.updated_user.clone());
  let original_record = must_get_valid_record(input.original_action_hash.clone())?;

  let record_option = get_latest_user(input.original_action_hash.clone())?;
  user.status = record_option.status;

  let author = original_record.action().author().clone();
  if author != agent_info()?.agent_initial_pubkey {
    return Err(wasm_error(
      "Only the author of a User profile can update it",
    ));
  }

  let updated_user_hash = update_entry(input.previous_action_hash.clone(), &user)?;

  create_link(
    input.original_action_hash.clone(),
    updated_user_hash.clone(),
    LinkTypes::UserUpdates,
    (),
  )?;

  let record = get(updated_user_hash.clone(), GetOptions::default())?
    .ok_or(wasm_error("Could not find the newly updated User profile"))?;

  Ok(record)
}
