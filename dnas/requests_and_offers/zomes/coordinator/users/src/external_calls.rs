use hdk::prelude::*;
use utils::wasm_error;

pub fn check_if_agent_is_administrator(agent_pubkey: AgentPubKey) -> ExternResult<bool> {
  let zome_call_response = call(
    CallTargetCell::Local,
    ZomeName("administration".into()),
    FunctionName("check_if_agent_is_administrator".into()),
    None,
    agent_pubkey.clone(),
  )?;

  if let ZomeCallResponse::Ok(response) = zome_call_response {
    Ok(response.decode().unwrap())
  } else {
    Err(wasm_error(
      "Error while calling the check_if_agent_is_administrator function of the administration zome",
    ))
  }
}

pub fn create_status(user_original_action_hash: ActionHash) -> ExternResult<Record> {
  let zome_call_response = call(
    CallTargetCell::Local,
    ZomeName("administration".into()),
    FunctionName("create_status".into()),
    None,
    user_original_action_hash.clone(),
  )?;

  if let ZomeCallResponse::Ok(response) = zome_call_response {
    Ok(response.decode().unwrap())
  } else {
    Err(wasm_error(
      "Error while calling the create_status function of the administration zome",
    ))
  }
}
