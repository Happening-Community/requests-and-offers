#[cfg(test)]
mod tests {
    use std::str::FromStr;

    use chrono::Duration;
    use hdi::prelude::Timestamp;

    use crate::status::SuspendedStatus::*;
    use crate::status::*;

    #[test]
    fn test_from_str() {
        assert_eq!(Status::from("pending"), Status::Pending);
        assert_eq!(Status::from("accepted"), Status::Accepted);
        assert_eq!(Status::from("rejected"), Status::Rejected);
        assert_eq!(Status::from("suspended"), Status::Suspended(Indefinitely));
        assert_eq!(
            Status::from("suspended 2022-01-01T00:00:00Z"),
            Status::Suspended(Temporarily(
                Timestamp::from_str("2022-01-01T00:00:00Z").unwrap()
            ))
        );
    }

    #[test]
    fn test_parsing_invalid_timestamp() {
        let status = Status::from_str("suspended 2asd022-01-01T00:00:00.000Z")
            .map_err(|err| eprintln!("Status parsing error: {:?}, defaulting to 'pending'", err))
            .unwrap_or_default();
        assert_eq!(status, Status::Pending);
    }

    #[test]
    fn test_parsing_invalid_status() {
        let status = Status::from_str("invalid status")
            .map_err(|err| eprintln!("Status parsing error: {:?}, defaulting to 'pending'", err))
            .unwrap_or_default();
        assert_eq!(status, Status::Pending);
    }

    #[test]
    fn test_7_days_suspension() {
        let mut status = Status::from("Accepted");
        status.suspend(Some(Duration::days(7)));

        let remaining_time = status.get_suspension_time_remaining();
        assert!(remaining_time.unwrap().num_days() >= Duration::days(6).num_days());
    }

    #[test]
    fn test_indefinitely_suspended() {
        let mut status = Status::from("Accepted");
        status.suspend(None);
        assert_eq!(status, Status::Suspended(Indefinitely));
    }

    #[test]
    fn test_unsuspend() {
        let mut status = Status::from("Accepted");
        status.unsuspend();
        assert_eq!(status, Status::Accepted);
    }

    #[test]
    fn test_unsuspend_if_time_passed() {
        let timestamp_1_hours_ago = Timestamp::from_micros(
            Timestamp::now().as_micros() - Duration::hours(1).num_microseconds().unwrap_or(0),
        );
        let mut status = Status::from(format!("suspended {}", timestamp_1_hours_ago).as_str());
        status.unsuspend_if_time_passed();
        assert_eq!(status, Status::Accepted);
    }
}
