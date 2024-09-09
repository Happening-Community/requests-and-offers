use administration_integrity::*;
use hdk::prelude::*;
use WasmErrorInner::*;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct EntityWithActionHashInput {
  pub entity: String,
  pub entity_action_hash: ActionHash,
}

#[hdk_extern]
pub fn register_administrator(input: EntityWithActionHashInput) -> ExternResult<bool> {
  if check_if_entity_is_administrator(input.clone())? {
    return Err(wasm_error!(Guest("Allready an Administrator".to_string())));
  }

  let path = Path::from(format!("{}.administrators", input.entity));
  create_link(
    path.path_entry_hash()?,
    input.entity_action_hash.clone(),
    LinkTypes::AllAdministrators,
    (),
  )?;

  create_link(
    agent_info()?.agent_latest_pubkey.clone(),
    path.path_entry_hash()?,
    LinkTypes::AgentAdministrators,
    (),
  )?;
  Ok(true)
}

#[hdk_extern]
pub fn add_administrator(input: EntityWithActionHashInput) -> ExternResult<bool> {
  if !check_if_entity_is_administrator(input.clone())? {
    return Err(wasm_error!(Guest(
      "Only administrators can add administrators".to_string()
    )));
  }

  register_administrator(input)?;
  Ok(true)
}

#[hdk_extern]
pub fn get_all_administrators_links(entity: String) -> ExternResult<Vec<Link>> {
  let path = Path::from(format!("{}.administrators", entity));
  let links = get_links(path.path_entry_hash()?, LinkTypes::AllAdministrators, None)?;
  Ok(links)
}

#[derive(Serialize, Deserialize, Debug)]
struct CheckIfEntityIsAdminInput {
  entity: String,
  entity_action_hash: ActionHash,
}

#[hdk_extern]
pub fn check_if_entity_is_administrator(input: EntityWithActionHashInput) -> ExternResult<bool> {
  let links = get_all_administrators_links(input.entity)?;
  if links
    .iter()
    .any(|link| link.target == input.entity_action_hash.clone().into())
  {
    return Ok(true);
  }
  Ok(false)
}

#[hdk_extern]
pub fn check_if_agent_is_administrator(agent_pubkey: AgentPubKey) -> ExternResult<bool> {
  let agent_administrator_links = get_links(agent_pubkey, LinkTypes::AgentAdministrators, None)?;
  if !agent_administrator_links.is_empty() {
    return Ok(true);
  }

  Ok(false)
}

#[hdk_extern]
pub fn remove_administrator(input: EntityWithActionHashInput) -> ExternResult<bool> {
  if !check_if_agent_is_administrator(agent_info()?.agent_initial_pubkey)? {
    return Err(wasm_error!(Guest(
      "Only administrators can remove administrators".to_string()
    )));
  }

  let administrators_links = get_all_administrators_links(input.entity.clone())?;
  if administrators_links.len() == 1 {
    return Err(wasm_error!(Guest(
      "There must be at least one administrator".to_string()
    )));
  }

  let links = get_all_administrators_links(input.entity)?;
  let link = links
    .iter()
    .find(|link| link.target == input.entity_action_hash.clone().into())
    .ok_or(wasm_error!(Guest(
      "Could not find the administrator link".to_string()
    )))?;

  delete_link(link.create_link_hash.clone())?;
  Ok(true)
}
