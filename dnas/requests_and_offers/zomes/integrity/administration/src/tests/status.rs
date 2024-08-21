#[cfg(test)]
mod status_tests {
  // use std::str::FromStr;

  // use chrono::Duration;
  // use hdi::prelude::Timestamp;

  // use crate::status::SuspendedStatusType::*;
  use crate::status::*;

  #[test]
  fn test_create_basic_status() {
    let mut status = Status::pending();
    assert_eq!(status.status_type, "pending");

    status = Status::accept();
    assert_eq!(status.status_type, "accepted");

    status = Status::reject();
    assert_eq!(status.status_type, "rejected");
  }

  // #[test]
  //   fn test_parsing_invalid_timestamp() {
  //     let status = Status::from_str("suspended 2asd022-01-01T00:00:00.000Z")
  //       .map_err(|err| eprintln!("Status parsing error: {:?}, defaulting to 'pending'", err))
  //       .unwrap_or_default();
  //     assert_eq!(status, Status::Pending);
  //   }

  //   #[test]
  //   fn test_parsing_invalid_status() {
  //     let status = Status::from_str("invalid status")
  //       .map_err(|err| eprintln!("Status parsing error: {:?}, defaulting to 'pending'", err))
  //       .unwrap_or_default();
  //     assert_eq!(status, Status::Pending);
  //   }

  //   #[test]
  //   fn test_7_days_suspension() {
  //     let now = Timestamp::now();
  //     let mut status = Status::from("Accepted");
  //     status
  //       .suspend(Some((Duration::days(7), &Timestamp::now())))
  //       .unwrap();

  //     let remaining_time = match status {
  //       Status::Suspended(suspended_status) => {
  //         Some(suspended_status.get_suspension_time_remaining(&now))
  //       }
  //       _ => None,
  //     }
  //     .unwrap();

  //     assert_eq!(remaining_time.unwrap().num_days(), 7);
  //   }

  //   #[test]
  //   fn test_indefinitely_suspended() {
  //     let mut status = Status::from("Accepted");
  //     status.suspend(None).unwrap();
  //     assert_eq!(status, Status::Suspended(Indefinitely));
  //   }

  //   #[test]
  //   fn test_unsuspend() {
  //     let mut status = Status::from("Accepted");
  //     status.unsuspend();
  //     assert_eq!(status, Status::Accepted);
  //   }

  //   #[test]
  //   fn test_unsuspend_if_time_passed() {
  //     let now = Timestamp::now();
  //     let timestamp_1_hours_ago = Timestamp::from_micros(
  //       Timestamp::now().as_micros() - Duration::hours(1).num_microseconds().unwrap_or(0),
  //     );
  //     let mut status = Status::from(format!("suspended {}", timestamp_1_hours_ago).as_str());
  //     status.unsuspend_if_time_passed(&now);
  //     assert_eq!(status, Status::Accepted);
  //   }
}
