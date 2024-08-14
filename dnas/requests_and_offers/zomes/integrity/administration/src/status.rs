use core::panic;
use std::{error::Error, fmt::Display, str::FromStr};

use chrono::Duration;
use hdi::prelude::*;

use SuspendedStatus::*;

#[derive(Clone, Debug, PartialEq, Default)]
pub enum SuspendedStatus<Timestamp> {
  Temporarily(Timestamp),
  #[default]
  Indefinitely,
}

impl SuspendedStatus<Timestamp> {
  pub fn is_temporarily(&self) -> bool {
    matches!(self, Self::Temporarily(_))
  }

  pub fn is_indefinitely(&self) -> bool {
    matches!(self, Self::Indefinitely)
  }

  pub fn unwrap(&self) -> Timestamp {
    match self {
      Self::Temporarily(time) => *time,
      Self::Indefinitely => panic!("Indefinitely suspended"),
    }
  }

  pub fn get_suspension_time_remaining(&self, now: &Timestamp) -> Option<Duration> {
    match self {
      Self::Temporarily(time) => Some(Duration::microseconds(
        time
          .checked_difference_signed(now)
          .unwrap_or_default()
          .num_microseconds()?,
      )),
      Self::Indefinitely => None,
    }
  }
}

#[derive(Clone, PartialEq, Default)]
pub enum StatusList {
  #[default]
  Pending,
  Accepted,
  Rejected,
  Suspended(SuspendedStatus<Timestamp>),
}

impl Display for StatusList {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      Self::Pending => write!(f, "pending"),
      Self::Accepted => write!(f, "accepted"),
      Self::Rejected => write!(f, "rejected"),
      Self::Suspended(Temporarily(time)) => {
        write!(f, "suspended {}", time)
      }
      Self::Suspended(Indefinitely) => write!(f, "suspended indefinitely"),
    }
  }
}

#[derive(Debug)]
pub enum StatusParsingError {
  InvalidStatus,
  InvalidTimestamp,
}

impl Display for StatusParsingError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{:?}", self)
  }
}

impl Error for StatusParsingError {}

impl FromStr for StatusList {
  type Err = StatusParsingError;

  fn from_str(status: &str) -> Result<Self, Self::Err> {
    let parts: Vec<&str> = status.split_whitespace().collect();
    match parts.as_slice() {
      ["pending"] => Ok(Self::Pending),
      ["accepted"] => Ok(Self::Accepted),
      ["rejected"] => Ok(Self::Rejected),
      ["suspended"] => Ok(Self::Suspended(Indefinitely)),
      ["suspended", timestamp] => Ok(Self::Suspended(Temporarily(
        Timestamp::from_str(timestamp).or(Err(StatusParsingError::InvalidTimestamp))?,
      ))),
      _ => Err(StatusParsingError::InvalidStatus),
    }
  }
}

impl From<&str> for StatusList {
  fn from(status: &str) -> Self {
    Self::from_str(status).unwrap_or_default()
  }
}

impl StatusList {
  pub fn suspend(&mut self, time: Option<(Duration, &Timestamp)>) -> ExternResult<()> {
    if time.is_none() {
      *self = StatusList::Suspended(Indefinitely);
      return Ok(());
    }

    let duration = time.unwrap().0.num_microseconds().unwrap_or(0);
    let now = time.unwrap().1.as_micros();

    *self = StatusList::Suspended(Temporarily(Timestamp::from_micros(now + duration)));

    Ok(())
  }

  pub fn unsuspend(&mut self) {
    *self = StatusList::Accepted
  }

  pub fn unsuspend_if_time_passed(&mut self, now: &Timestamp) -> bool {
    match self {
      Self::Suspended(time) if time.is_temporarily() => {
        match time.get_suspension_time_remaining(now) {
          Some(time) if time.is_zero() || time < Duration::hours(1) => {
            self.unsuspend();
            true
          }
          _ => false,
        }
      }
      _ => false,
    }
  }
}

#[hdk_entry_helper]
#[derive(Clone, PartialEq)]
pub struct Status(pub String);

impl Default for Status {
  fn default() -> Self {
    Self(StatusList::Pending.to_string())
  }
}

impl From<StatusList> for Status {
  fn from(status: StatusList) -> Self {
    Self(status.to_string())
  }
}

impl Status {
  pub fn to_status_list(&self) -> StatusList {
    StatusList::from(self.0.as_str())
  }
}

pub fn validate_status(status: Status) -> ExternResult<ValidateCallbackResult> {
  if StatusList::from_str(status.0.as_str()).is_err() {
    return Ok(ValidateCallbackResult::Invalid(format!(
      "Status must be '{}', '{}', '{}' or suspended (with a timestamp or not).",
      StatusList::Pending,
      StatusList::Accepted,
      StatusList::Rejected,
    )));
  };

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
