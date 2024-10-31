use email_address::EmailAddress;
use hdi::prelude::*;
use utils::{errors::UtilsError, is_image};

#[hdk_entry_helper]
#[derive(Clone, PartialEq)]
pub struct Organization {
  pub name: String,
  pub description: String,
  pub logo: Option<SerializedBytes>,
  pub email: String,
  pub urls: Vec<String>,
  pub location: String,
}

pub fn validate_organization(organization: Organization) -> ExternResult<ValidateCallbackResult> {
  if let Some(bytes) = organization.logo {
    if !is_image(bytes) {
      return Ok(ValidateCallbackResult::Invalid(String::from(
        "Organization logo must be a valid image",
      )));
    }
  }

  if !EmailAddress::is_valid(&organization.email) {
    return Ok(ValidateCallbackResult::Invalid(String::from(
      "Email is not valid",
    )));
  }

  Ok(ValidateCallbackResult::Valid)
}

pub fn validate_update_organization(
  _action: Update,
  _organization: Organization,
  _original_action: EntryCreationAction,
  _original_organization: Organization,
) -> ExternResult<ValidateCallbackResult> {
  Ok(ValidateCallbackResult::Valid)
}

pub fn validate_delete_organization(
  _action: Delete,
  _original_action: EntryCreationAction,
  _original_organization: Organization,
) -> ExternResult<ValidateCallbackResult> {
  Ok(ValidateCallbackResult::Valid)
}

pub fn validate_create_link_organization_updates(
  _action: CreateLink,
  base_address: AnyLinkableHash,
  target_address: AnyLinkableHash,
  _tag: LinkTag,
) -> ExternResult<ValidateCallbackResult> {
  let action_hash = base_address
    .into_action_hash()
    .ok_or(UtilsError::ActionHashNotFound("organization"))?;
  let record = must_get_valid_record(action_hash)?;
  let _organization: crate::Organization = record
    .entry()
    .to_app_option()
    .map_err(|e| wasm_error!(e))?
    .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
      "Linked action must reference an entry"
    ))))?;
  // Check the entry type for the given action hash
  let action_hash = target_address
    .into_action_hash()
    .ok_or(UtilsError::ActionHashNotFound("organization"))?;
  let record = must_get_valid_record(action_hash)?;
  let _organization: crate::Organization = record
    .entry()
    .to_app_option()
    .map_err(|e| wasm_error!(e))?
    .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
      "Linked action must reference an entry"
    ))))?;
  Ok(ValidateCallbackResult::Valid)
}

pub fn validate_delete_link_organization_updates(
  _action: DeleteLink,
  _original_action: CreateLink,
  _base: AnyLinkableHash,
  _target: AnyLinkableHash,
  _tag: LinkTag,
) -> ExternResult<ValidateCallbackResult> {
  Ok(ValidateCallbackResult::Invalid(String::from(
    "OrganizationUpdates links cannot be deleted",
  )))
}
