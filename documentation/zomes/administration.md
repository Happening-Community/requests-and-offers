# Administration Zome

## 1. Introduction

## 2. Zome Integrity

``` rust
pub enum StatusType {
  Pending,
  Accepted,
  Rejected,
  SuspendedIndefinitely,
  SuspendedTemporarily,
}
```

``` rust
pub struct Status {
  pub status_type: String,
  pub reason: Option<String>,
  pub suspended_until: Option<String>,
}
```

``` rust
pub enum LinkTypes {
  AllAdministrators,
  StatusUpdates,
  AllStatus,
  AcceptedUsers,
}
```

## 3. Zome Coordinator

### Administrators

#### add_administrator

#### register_administrator

#### get_all_administrators_links

#### check_if_user_is_administrator

#### check_if_agent_is_administrator

#### remove_administrator

### Status

#### create_status

#### get_latest_status_record

#### get_latest_status

#### get_latest_status_record_for_user

#### get_latest_status_for_user

#### create_accepted_user_link

#### delete_accepted_user_link

#### get_accepted_users

#### get_all_revisions_for_status

#### update_user_status

#### suspend_user_temporarily

#### suspend_user_indefinitely

#### unsuspend_user_if_time_passed

#### unsuspend_user


