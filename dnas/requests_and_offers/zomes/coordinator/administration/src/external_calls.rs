use hdk::prelude::*;
use utils::wasm_error;

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
    Err(wasm_error(
      "Error while calling the get_agent_user_hash function of the users zome",
    ))
  }
}
