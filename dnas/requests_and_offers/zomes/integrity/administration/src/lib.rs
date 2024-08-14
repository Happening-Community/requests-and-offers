use hdi::prelude::*;
use status::*;

pub mod status;

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
#[hdk_entry_defs]
#[unit_enum(UnitEntryTypes)]
pub enum EntryTypes {
  Status(Status),
}

#[derive(Serialize, Deserialize)]
#[hdk_link_types]
pub enum LinkTypes {
  AllAdministrators,
  StatusUpdates,
  AllStatus,
  AcceptedUsers,
}

#[hdk_extern]
pub fn genesis_self_check(_data: GenesisSelfCheckData) -> ExternResult<ValidateCallbackResult> {
  Ok(ValidateCallbackResult::Valid)
}

pub fn validate_agent_joining(
  _agent_pub_key: AgentPubKey,
  _membrane_proof: &Option<MembraneProof>,
) -> ExternResult<ValidateCallbackResult> {
  Ok(ValidateCallbackResult::Valid)
}
