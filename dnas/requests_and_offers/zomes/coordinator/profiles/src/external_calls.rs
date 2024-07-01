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
