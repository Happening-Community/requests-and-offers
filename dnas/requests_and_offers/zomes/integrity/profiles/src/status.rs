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
}

#[derive(Clone, Debug, PartialEq, Default)]
pub enum Status {
    #[default]
    Pending,
    Accepted,
    Rejected,
    Suspended(SuspendedStatus<Timestamp>),
}

impl Display for Status {
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

impl FromStr for Status {
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

impl From<&str> for Status {
    fn from(status: &str) -> Self {
        Self::from_str(status).unwrap_or_default()
    }
}

impl Status {
    pub fn get_suspension_time_remaining(&self, now: &Timestamp) -> Option<Duration> {
        match self {
            Status::Suspended(time) if time.is_temporarily() => Some(Duration::microseconds(
                time.unwrap()
                    .checked_difference_signed(now)
                    .unwrap_or_default()
                    .num_microseconds()?,
            )),
            _ => None,
        }
    }

    pub fn suspend(&mut self, time: Option<(Duration, &Timestamp)>) -> ExternResult<()> {
        if time.is_none() {
            *self = Status::Suspended(Indefinitely);
            return Ok(());
        }

        let duration = time.unwrap().0.num_microseconds().unwrap_or(0);
        let now = time.unwrap().1.as_micros();

        match self {
            Status::Suspended(timestamp) if timestamp.is_temporarily() => {
                *self = Status::Suspended(Temporarily(Timestamp::from_micros(
                    timestamp.unwrap().as_micros() + duration,
                )))
            }
            _ => *self = Status::Suspended(Temporarily(Timestamp::from_micros(now + duration))),
        }

        Ok(())
    }

    pub fn unsuspend(&mut self) {
        *self = Status::Accepted
    }

    pub fn unsuspend_if_time_passed(&mut self, now: &Timestamp) -> bool {
        if let Some(time) = self.get_suspension_time_remaining(now) {
            println!("Time remaining: {:?}", time);
            if time.is_zero() || time < Duration::hours(1) {
                self.unsuspend();
                return true;
            }
        }

        false
    }
}
