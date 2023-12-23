use hdi::prelude::*;

#[hdk_entry_helper]
#[derive(Clone, PartialEq)]
pub struct IndividualProfile {
    pub name: String,
    pub nickname: String,
    pub bio: String,
    pub profile_picture: Option<SerializedBytes>,
    pub individual_type: String,
    pub skills: Vec<String>,
    pub email: String,
    pub phone: Option<String>,
    pub time_zone: String,
    pub location: String,
    pub created_at: Timestamp,
}

fn validate_individual_type(individual_type: String) -> bool {
    let allowed_types = ["advocate", "developer"];
    !allowed_types.contains(&individual_type.as_str())
}

pub fn validate_create_individual_profile(
    individual_profile: IndividualProfile,
) -> ExternResult<ValidateCallbackResult> {
    if validate_individual_type(individual_profile.individual_type) {
        return Ok(ValidateCallbackResult::Invalid(String::from(
            "Individual Type must be 'advocate' or 'developer'.",
        )));
    };

    // TODO: Validate the profile picture, the email and the time zone

    Ok(ValidateCallbackResult::Valid)
}

pub fn validate_update_individual_profile(
    _action: Update,
    individual_profile: IndividualProfile,
    _original_action: EntryCreationAction,
    _original_individual_profile: IndividualProfile,
) -> ExternResult<ValidateCallbackResult> {
    if validate_individual_type(individual_profile.individual_type) {
        return Ok(ValidateCallbackResult::Invalid(String::from(
            "Individual Type must be 'advocate' or 'developer'.",
        )));
    }

    Ok(ValidateCallbackResult::Valid)
}

pub fn validate_delete_individual_profile(
    _action: Delete,
    _original_action: EntryCreationAction,
    _original_individual_profile: IndividualProfile,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Invalid(String::from(
        "Indiviual Profile cannot be deleted",
    )))
}

pub fn validate_create_link_individual_profile_updates(
    _action: CreateLink,
    base_address: AnyLinkableHash,
    target_address: AnyLinkableHash,
    _tag: LinkTag,
) -> ExternResult<ValidateCallbackResult> {
    // Check the entry type for the given action hash
    let action_hash = ActionHash::from(base_address);
    let record = must_get_valid_record(action_hash)?;
    let _individual_profile: crate::IndividualProfile = record
        .entry()
        .to_app_option()
        .map_err(|e| wasm_error!(e))?
        .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
            "Linked action must reference an entry"
        ))))?;
    // Check the entry type for the given action hash
    let action_hash = ActionHash::from(target_address);
    let record = must_get_valid_record(action_hash)?;
    let _individual_profile: crate::IndividualProfile = record
        .entry()
        .to_app_option()
        .map_err(|e| wasm_error!(e))?
        .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
            "Linked action must reference an entry"
        ))))?;
    // TODO: add the appropriate validation rules
    Ok(ValidateCallbackResult::Valid)
}

pub fn validate_delete_link_individual_profile_updates(
    _action: DeleteLink,
    _original_action: CreateLink,
    _base: AnyLinkableHash,
    _target: AnyLinkableHash,
    _tag: LinkTag,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Invalid(String::from(
        "IndividualProfileUpdates links cannot be deleted",
    )))
}
