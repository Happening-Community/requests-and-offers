use hdk::prelude::*;
use WasmErrorInner::*;

pub fn get_agent_user_hash(agent_pubkey: AgentPubKey) -> ExternResult<Option<ActionHash>> {
  let zome_call_response = call(
    CallTargetCell::Local,
    ZomeName("users".into()),
    FunctionName("get_agent_user_hash".into()),
    None,
    agent_pubkey.clone(),
  )?;

  if let ZomeCallResponse::Ok(response) = zome_call_response {
    Ok(response.decode().unwrap())
  } else {
    Err(wasm_error!(Guest(
      "Error while calling the get_agent_user_hash function of the users zome".to_string()
    )))
  }
}

pub fn get_profile_status_link(user_original_hash: ActionHash) -> ExternResult<Option<Link>> {
  let zome_call_response = call(
    CallTargetCell::Local,
    ZomeName("users".into()),
    FunctionName("get_profile_status_link".into()),
    None,
    user_original_hash.clone(),
  )?;

  if let ZomeCallResponse::Ok(response) = zome_call_response {
    Ok(response.decode().unwrap())
  } else {
    Err(wasm_error!(Guest(
      "Error while calling the get_profile_status_link function of the users zome".to_string()
    )))
  }
}
