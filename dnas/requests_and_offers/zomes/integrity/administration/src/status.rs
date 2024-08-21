use std::str::FromStr;

use chrono::Duration;
use hdi::prelude::*;

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub enum StatusType {
  Pending,
  Accepted,
  Rejected,
  SuspendedIndefinitely,
  SuspendedTemporarily,
}

impl FromStr for StatusType {
  type Err = String;

  fn from_str(s: &str) -> Result<Self, Self::Err> {
    match s {
      "pending" => Ok(Self::Pending),
      "accepted" => Ok(Self::Accepted),
      "rejected" => Ok(Self::Rejected),
      "suspended indefinitely" => Ok(Self::SuspendedIndefinitely),
      "suspended temporarily" => Ok(Self::SuspendedTemporarily),
      _ => Err(format!("Invalid status type: {}", s)),
    }
  }
}

#[hdk_entry_helper]
#[derive(Clone, PartialEq)]
pub struct Status {
  pub status_type: String,
  pub reason: Option<String>,
  pub timestamp: Option<Timestamp>,
}

impl Status {
  pub fn pending() -> Self {
    Self {
      status_type: "pending".to_string(),
      reason: None,
      timestamp: None,
    }
  }

  pub fn accept() -> Self {
    Self {
      status_type: "accepted".to_string(),
      reason: None,
      timestamp: None,
    }
  }

  pub fn reject() -> Self {
    Self {
      status_type: "rejected".to_string(),
      reason: None,
      timestamp: None,
    }
  }

  pub fn suspend(reason: &str, time: Option<(Duration, &Timestamp)>) -> Self {
    if time.is_some() {
      let duration = time.unwrap().0.num_microseconds().unwrap_or(0);
      let now = time.unwrap().1.as_micros();

      return Self {
        status_type: "suspended temporarily".to_string(),
        reason: Some(reason.to_string()),
        timestamp: Some(Timestamp::from_micros(now + duration)),
      };
    }

    Self {
      status_type: "suspended indefinitely".to_string(),
      reason: Some(reason.to_string()),
      timestamp: None,
    }
  }

  pub fn unsuspend(&mut self) -> Self {
    self.status_type = "accepted".to_string();

    self.to_owned()
  }

  pub fn get_suspension_time_remaining(&self, now: &Timestamp) -> Option<Duration> {
    if let Some(timestamp) = &self.timestamp {
      return Some(Duration::microseconds(
        timestamp
          .checked_difference_signed(now)
          .unwrap_or_default()
          .num_microseconds()?,
      ));
    }
    None
  }

  pub fn unsuspend_if_time_passed(&mut self, now: &Timestamp) -> bool {
    if let Some(time) = self.get_suspension_time_remaining(now) {
      if time.is_zero() || time < Duration::hours(1) {
        self.unsuspend();
        return true;
      }
    }
    false
  }
}

pub fn validate_status(status: Status) -> ExternResult<ValidateCallbackResult> {
  if StatusType::from_str(&status.status_type).is_err() {
    return Ok(ValidateCallbackResult::Invalid(format!(
      "Invalid status type: {}",
      status.status_type
    )));
  }

  if status.status_type.starts_with("suspended") && status.reason.is_none() {
    return Ok(ValidateCallbackResult::Invalid(String::from(
      "Suspended status must have a reason",
    )));
  }

  if status.status_type == "suspended temporarily" && status.timestamp.is_none() {
    return Ok(ValidateCallbackResult::Invalid(String::from(
      "Temporarily suspended status must have a timestamp",
    )));
  }

  if status.status_type == "suspended indefinitely" && status.timestamp.is_some() {
    return Ok(ValidateCallbackResult::Invalid(String::from(
      "Indefinitely suspended status must not have a timestamp",
    )));
  }

  Ok(ValidateCallbackResult::Valid)
}

pub fn validate_update_user(
  _action: Update,
  _status: Status,
  _original_action: EntryCreationAction,
  _original_status: Status,
) -> ExternResult<ValidateCallbackResult> {
  Ok(ValidateCallbackResult::Valid)
}

pub fn validate_delete_status(
  _action: Delete,
  _original_action: EntryCreationAction,
  _original_status: Status,
) -> ExternResult<ValidateCallbackResult> {
  Ok(ValidateCallbackResult::Invalid(String::from(
    "User profile cannot be deleted",
  )))
}

pub fn validate_create_link_status_updates(
  _action: CreateLink,
  base_address: AnyLinkableHash,
  target_address: AnyLinkableHash,
  _tag: LinkTag,
) -> ExternResult<ValidateCallbackResult> {
  let action_hash = base_address.into_action_hash().unwrap();
  let record = must_get_valid_record(action_hash)?;
  let _status: crate::Status = record
    .entry()
    .to_app_option()
    .map_err(|e| wasm_error!(e))?
    .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
      "Linked action must reference an entry"
    ))))?;
  // Check the entry type for the given action hash
  let action_hash = target_address.into_action_hash().unwrap();
  let record = must_get_valid_record(action_hash)?;
  let _status: crate::Status = record
    .entry()
    .to_app_option()
    .map_err(|e| wasm_error!(e))?
    .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
      "Linked action must reference an entry"
    ))))?;
  Ok(ValidateCallbackResult::Valid)
}

pub fn validate_delete_link_status_updates(
  _action: DeleteLink,
  _original_action: CreateLink,
  _base: AnyLinkableHash,
  _target: AnyLinkableHash,
  _tag: LinkTag,
) -> ExternResult<ValidateCallbackResult> {
  Ok(ValidateCallbackResult::Invalid(String::from(
    "StatusUpdates links cannot be deleted",
  )))
}
