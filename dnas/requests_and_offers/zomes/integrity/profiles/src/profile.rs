use crate::status::*;
use std::{fmt::Display, str::FromStr};

use hdi::prelude::*;
use image::io::Reader as ImageReader;

use crate::status::SuspendedStatus::*;

/// Represents a profile Entry with various attributes such as name, nickname, bio, etc.
#[hdk_entry_helper]
#[derive(Clone, PartialEq)]
pub struct Profile {
    /// The full name of the user.
    pub name: String,
    /// A shorter version of the user's name, often used for display purposes.
    pub nickname: String,
    /// A brief biography about the idividual.
    pub bio: String,
    /// An optional serialized image representing the profile picture.
    pub picture: Option<SerializedBytes>,
    /// The type of user, either 'advocate' or 'creator'.
    pub user_type: String,
    /// A list of skills associated with the user.
    pub skills: Vec<String>,
    /// The user's email address.
    pub email: String,
    /// An optional phone number for the user.
    pub phone: Option<String>,
    /// The time zone in which the user resides.
    pub time_zone: String,
    /// The location where the user is based.
    pub location: String,
    /// The status of the user, either 'pending', 'accepted' or 'rejected'.
    pub status: String,
}

enum AllowedTypes {
    Advocate,
    Creator,
}

impl Display for AllowedTypes {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Advocate => write!(f, "advocate"),
            Self::Creator => write!(f, "creator"),
        }
    }
}

impl FromStr for AllowedTypes {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "advocate" => Ok(Self::Advocate),
            "creator" => Ok(Self::Creator),
            _ => Err(()),
        }
    }
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

pub fn validate_profile(profile: Profile) -> ExternResult<ValidateCallbackResult> {
    if AllowedTypes::from_str(profile.user_type.as_str()).is_err() {
        return Ok(ValidateCallbackResult::Invalid(format!(
            "Person Type must be '{}' or '{}'.",
            AllowedTypes::Advocate,
            AllowedTypes::Creator,
        )));
    };

    if Status::from_str(profile.status.as_str()).is_err() {
        return Ok(ValidateCallbackResult::Invalid(format!(
            "Status must be '{}', '{}', '{}' or suspended (with a timestamp or not).",
            Status::Pending,
            Status::Accepted,
            Status::Rejected,
        )));
    };

    if let Some(bytes) = profile.picture {
        if !is_image(bytes) {
            return Ok(ValidateCallbackResult::Invalid(String::from(
                "Profile picture must be a valid image",
            )));
        }
    }

    // TODO: Validate the email and the time zone

    Ok(ValidateCallbackResult::Valid)
}

pub fn validate_update_profile(
    _action: Update,
    _profile: Profile,
    _original_action: EntryCreationAction,
    _original_profile: Profile,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}

pub fn validate_delete_profile(
    _action: Delete,
    _original_action: EntryCreationAction,
    _original_profile: Profile,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Invalid(String::from(
        "Indiviual Profile cannot be deleted",
    )))
}

pub fn validate_create_link_profile_updates(
    _action: CreateLink,
    base_address: AnyLinkableHash,
    target_address: AnyLinkableHash,
    _tag: LinkTag,
) -> ExternResult<ValidateCallbackResult> {
    let action_hash = base_address.into_action_hash().unwrap();
    let record = must_get_valid_record(action_hash)?;
    let _profile: crate::Profile = record
        .entry()
        .to_app_option()
        .map_err(|e| wasm_error!(e))?
        .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
            "Linked action must reference an entry"
        ))))?;
    // Check the entry type for the given action hash
    let action_hash = target_address.into_action_hash().unwrap();
    let record = must_get_valid_record(action_hash)?;
    let _profile: crate::Profile = record
        .entry()
        .to_app_option()
        .map_err(|e| wasm_error!(e))?
        .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
            "Linked action must reference an entry"
        ))))?;
    Ok(ValidateCallbackResult::Valid)
}

pub fn validate_delete_link_profile_updates(
    _action: DeleteLink,
    _original_action: CreateLink,
    _base: AnyLinkableHash,
    _target: AnyLinkableHash,
    _tag: LinkTag,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Invalid(String::from(
        "ProfileUpdates links cannot be deleted",
    )))
}
