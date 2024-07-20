use std::{fmt::Display, str::FromStr};

use chrono::Duration;
use hdi::prelude::Timestamp;

#[derive(Clone, Debug)]
pub enum Status {
    Pending,
    Accepted,
    Rejected,
    Suspended(Option<Timestamp>),
}

impl Display for Status {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Pending => write!(f, "pending"),
            Self::Accepted => write!(f, "accepted"),
            Self::Rejected => write!(f, "rejected"),
            Self::Suspended(_) => write!(f, "suspended [duration in seconds]"),
        }
    }
}

impl FromStr for Status {
    type Err = ();

    fn from_str(status: &str) -> Result<Self, Self::Err> {
        let parts: Vec<&str> = status.split_whitespace().collect();
        match parts.as_slice() {
            ["pending"] => Ok(Self::Pending),
            ["accepted"] => Ok(Self::Accepted),
            ["rejected"] => Ok(Self::Rejected),
            ["suspended"] => Ok(Self::Suspended(None)),
            ["suspended", timestamp] => Ok(Self::Suspended(Some(
                Timestamp::from_str(timestamp).expect("Invalid timestamp"),
            ))),
            _ => Err(()),
        }
    }
}

impl Status {
    pub fn get_suspension_time_remaining(&self) -> Option<Duration> {
        let now = Timestamp::now();
        match self {
            Status::Suspended(time) if time.is_some() => Some(
                time.unwrap()
                    .checked_difference_signed(&now)
                    .unwrap_or(Duration::zero()),
            ),
            _ => None,
        }
    }

    pub fn suspend(&mut self, time: Duration) {
        let now = Timestamp::now().as_micros();
        let time = time.num_microseconds().unwrap_or(0);
        match self {
            Status::Suspended(timestamp) if timestamp.is_some() => {
                *self = Status::Suspended(Some(Timestamp::from_micros(
                    timestamp.unwrap().as_micros() + time,
                )))
            }
            _ => *self = Status::Suspended(Some(Timestamp::from_micros(now + time))),
        }
    }

    pub fn unsuspend(&mut self) {
        if self.get_suspension_time_remaining().is_some()
            && self.get_suspension_time_remaining().unwrap() == Duration::zero()
        {
            *self = Status::Accepted
        }
    }
}
