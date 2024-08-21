use core::panic;
use std::{error::Error, fmt::Display, str::FromStr};

use chrono::Duration;
use hdi::prelude::*;

use SuspendedStatusType::*;
use WasmErrorInner::*;

#[derive(Clone, Debug, PartialEq, Default)]
pub enum SuspendedStatusType<Timestamp> {
  Temporarily(Timestamp),
  #[default]
  Indefinitely,
}

impl SuspendedStatusType<Timestamp> {
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

#[derive(Clone, PartialEq)]
pub struct SuspendedStatus {
  pub reason: String,
  pub suspension_type: SuspendedStatusType<Timestamp>,
}

#[derive(Clone, PartialEq, Default)]
pub enum StatusType {
  #[default]
  Pending,
  Accepted,
  Rejected,
  Suspended(SuspendedStatus),
}

impl Display for StatusType {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      Self::Pending => write!(f, "pending"),
      Self::Accepted => write!(f, "accepted"),
      Self::Rejected => write!(f, "rejected"),
      Self::Suspended(suspend_status) => match suspend_status.suspension_type {
        Indefinitely => write!(f, "suspended indefinitely"),
        Temporarily(_) => write!(f, "suspended temporarily"),
      },
    }
  }
}

#[derive(Debug)]
pub enum StatusParsingError {
  InvalidStatus(Option<String>),
  InvalidTimestamp,
}

impl Display for StatusParsingError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      StatusParsingError::InvalidStatus(status) => {
        if let Some(status) = status {
          write!(f, "Invalid status: {}", status)
        } else {
          write!(f, "Invalid status")
        }
      }
      StatusParsingError::InvalidTimestamp => write!(f, "Invalid timestamp"),
    }
  }
}

impl Error for StatusParsingError {}

impl FromStr for StatusType {
  type Err = StatusParsingError;

  fn from_str(status: &str) -> Result<Self, Self::Err> {
    match status {
      "pending" => Ok(Self::Pending),
      "accepted" => Ok(Self::Accepted),
      "rejected" => Ok(Self::Rejected),
      _ => Err(StatusParsingError::InvalidStatus(Some(
        "Only valid parsable statuses are: pending, accepted, rejected".into(),
      ))),
    }
  }
}

impl From<&str> for StatusType {
  fn from(status: &str) -> Self {
    Self::from_str(status).unwrap_or_default()
  }
}

impl From<SuspendedStatus> for StatusType {
  fn from(status: SuspendedStatus) -> Self {
    Self::Suspended(status)
  }
}

impl StatusType {
  pub fn suspend(
    &mut self,
    reason: &str,
    time: Option<(Duration, &Timestamp)>,
  ) -> ExternResult<()> {
    if time.is_none() {
      *self = StatusType::from(SuspendedStatus {
        reason: reason.to_string(),
        suspension_type: Indefinitely,
      });
      return Ok(());
    }

    let duration = time.unwrap().0.num_microseconds().unwrap_or(0);
    let now = time.unwrap().1.as_micros();

    *self = StatusType::Suspended(SuspendedStatus {
      reason: reason.to_string(),
      suspension_type: Temporarily(Timestamp::from_micros(now + duration)),
    });

    Ok(())
  }

  pub fn unsuspend(&mut self) {
    *self = StatusType::Accepted
  }

  pub fn unsuspend_if_time_passed(&mut self, now: &Timestamp) -> bool {
    match self {
      Self::Suspended(suspended_status) if suspended_status.suspension_type.is_temporarily() => {
        match suspended_status
          .suspension_type
          .get_suspension_time_remaining(now)
        {
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
pub struct Status {
  pub status_type: String,
  pub reason: Option<String>,
  pub timestamp: Option<Timestamp>,
}

impl Default for Status {
  fn default() -> Self {
    Self {
      status_type: StatusType::Pending.to_string(),
      reason: None,
      timestamp: None,
    }
  }
}

impl From<StatusType> for Status {
  fn from(status: StatusType) -> Self {
    match status {
      StatusType::Pending => Status::default(),
      StatusType::Accepted => Status {
        status_type: StatusType::Accepted.to_string(),
        reason: None,
        timestamp: None,
      },
      StatusType::Rejected => Status {
        status_type: StatusType::Rejected.to_string(),
        reason: None,
        timestamp: None,
      },
      StatusType::Suspended(suspend_status) => match suspend_status.suspension_type {
        Indefinitely => Status {
          status_type: StatusType::Suspended(suspend_status.clone()).to_string(),
          reason: Some(suspend_status.reason),
          timestamp: None,
        },
        Temporarily(time) => Status {
          status_type: StatusType::Suspended(suspend_status.clone()).to_string(),
          reason: Some(suspend_status.reason),
          timestamp: Some(time),
        },
      },
    }
  }
}

impl Status {
  pub fn to_status_type(&self) -> ExternResult<StatusType> {
    match self.status_type.as_str() {
      "pending" => Ok(StatusType::Pending),
      "accepted" => Ok(StatusType::Accepted),
      "rejected" => Ok(StatusType::Rejected),
      "suspended indefinitely" => Ok(StatusType::Suspended(SuspendedStatus {
        reason: self.reason.clone().unwrap_or_default(),
        suspension_type: Indefinitely,
      })),
      "suspended temporarily" => Ok(StatusType::Suspended(SuspendedStatus {
        reason: self.reason.clone().unwrap_or_default(),
        suspension_type: Temporarily(self.timestamp.unwrap()),
      })),
      _ => Err(wasm_error!(Guest(
        StatusParsingError::InvalidStatus(None).to_string()
      ))),
    }
  }

  pub fn accept() -> Self {
    Self {
      status_type: StatusType::Accepted.to_string(),
      reason: None,
      timestamp: None,
    }
  }

  pub fn reject() -> Self {
    Self {
      status_type: StatusType::Rejected.to_string(),
      reason: None,
      timestamp: None,
    }
  }

  pub fn suspend(reason: &str, time: Option<(Duration, &Timestamp)>) -> Self {
    Self {
      status_type: StatusType::Suspended(SuspendedStatus {
        reason: reason.to_string(),
        suspension_type: Indefinitely,
      })
      .to_string(),
      reason: Some(reason.to_string()),
      timestamp: time.map(|time| *time.1),
    }
  }
}

pub fn validate_status(status: Status) -> ExternResult<ValidateCallbackResult> {
  if status.to_status_type().is_err() {
    return Ok(ValidateCallbackResult::Invalid("Invalid status".into()));
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
