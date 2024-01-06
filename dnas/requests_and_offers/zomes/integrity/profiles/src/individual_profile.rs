use hdi::prelude::*;
use image::io::Reader as ImageReader;

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

const ALLOWED_TYPES: [&str; 2] = ["advocate", "developer"];

fn is_individual_type(individual_type: String) -> bool {
    !ALLOWED_TYPES.contains(&individual_type.as_str())
}

fn is_image(bytes: SerializedBytes) -> bool {
    let data = bytes.bytes().to_vec();
    if let Ok(_img) = ImageReader::new(std::io::Cursor::new(data))
        .with_guessed_format()
        .unwrap()
        .decode()
    {
        return true;
    }
    false
}

pub fn validate_individual_profile(
    individual_profile: IndividualProfile,
) -> ExternResult<ValidateCallbackResult> {
    if is_individual_type(individual_profile.individual_type) {
        return Ok(ValidateCallbackResult::Invalid(String::from(
            "Individual Type must be 'advocate' or 'developer'.",
        )));
    };

    if let Some(bytes) = individual_profile.profile_picture {
        if !is_image(bytes) {
            return Ok(ValidateCallbackResult::Invalid(String::from(
                "Profile picture must be a valid image",
            )));
        }
    }

    // TODO: Validate the email and the time zone

    Ok(ValidateCallbackResult::Valid)
}

pub fn validate_update_individual_profile(
    _action: Update,
    _individual_profile: IndividualProfile,
    _original_action: EntryCreationAction,
    _original_individual_profile: IndividualProfile,
) -> ExternResult<ValidateCallbackResult> {
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
