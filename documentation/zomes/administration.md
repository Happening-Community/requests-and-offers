# Administration Zome

## 1. Introduction

The Administration Zome is a crucial component of the Requests and Offers Holochain application. It provides functionality for managing administrators and user statuses within the system.

## 2. Zome Integrity

The Administration Zome implements several integrity functions to ensure data consistency and security:

### Entry Types

The zome defines one main entry type, `Status`, which represents a user's status with various attributes such as status type, reason, and suspension time.

``` rust
pub struct Status {
  pub status_type: String,
  pub reason: Option<String>,
  pub suspended_until: Option<String>,
}
```

The `StatusType` enum represents the various status types that can be associated with an entity.
It is used for validating the `status_type` field of the `Status` entry.

``` rust
pub enum StatusType {
  Pending,
  Accepted,
  Rejected,
  SuspendedIndefinitely,
  SuspendedTemporarily,
}
```


### Link Types

The zome defines six link types:

``` rust
pub enum LinkTypes {
  AllAdministrators,
  AgentAdministrators,
  StatusUpdates,
  AllStatus,
  EntityStatus,
  AcceptedEntity,
}
```

### Validations functions

#### validate_status

Validates a Status entry:

- Ensures the status type is valid (one of: "**pending**", "**accepted**", "**rejected**", "**suspended indefinitely**", "**suspended temporarily**")
- Checks that suspended statuses have a reason
- Verifies that temporarily suspended statuses have a timestamp
- Ensures indefinitely suspended statuses don't have a timestamp

``` rust
pub fn validate_status(status: Status) -> ExternResult<ValidateCallbackResult>
```
#### validate_update_status

Currently allows all updates without additional validations. It still performs the verification of the `validate_status` function.

#### validate_delete_status

Prevents deletion of status entries.


## 3. Zome Coordinator

### Administrators

#### register_administrator

``` rust
pub fn register_administrator(user_action_hash: ActionHash) -> ExternResult<bool>
```

Registers a user as an administrator for a specific entity.

This function checks if the user is already an administrator for the entity. If not, it creates a link between the entity's administrators path and the user's action hash, and creates another link between the agent's public key and the entity's administrators path.

Returns `Ok(true)` if successful, or an error if:
- The user is already an administrator for the entity

The `register_administrator` is temporarily used to manually add the first administrator. In the future, its logic will be moved to the `add_administrator` function and the first administrator will be registered using the `progenitor` pattern. `register_administrator` must be secured to ensure that it cannot be called by anyone other than the first administrator.

#### add_administrator

``` rust
pub fn add_administrator(user_action_hash: ActionHash) -> ExternResult<bool>
```
Adds a new administrator to the system for a specific entity.

This function checks if the calling agent is already an administrator for the entity. If so, it calls `register_administrator` to add the new administrator.

Returns `Ok(true)` if successful, or an error if:
- The calling agent is not an administrator for the entity

#### get_all_administrators_links

``` rust
pub fn get_all_administrators_links(entity: String) -> ExternResult<Vec<Link>>
```

Retrieves all links representing administrators for a specific entity in the system.

This function retrieves all links of type `AllAdministrators` from the entity's administrators path.

Returns an error if:
- Unable to retrieve links

#### check_if_entity_is_administrator

``` rust
pub fn check_if_entity_is_administrator(input: EntityWithActionHash) -> ExternResult<bool>
```

Checks if the agent associated with a given public key is an administrator for any entity.

This function checks if there are any links of type AgentAdministrators associated with the agent's public key.

Returns `true` if the agent is an administrator for any entity, `false` otherwise

#### check_if_agent_is_administrator

``` rust
pub fn check_if_agent_is_administrator(input: EntityWithAgentPubkey) -> ExternResult<bool>
```

Checks if the agent associated with a given public key is an administrator for any entity.

This function checks if there are any links of type `AgentAdministrators` associated with the agent's public key.

Returns `true` if the agent is an administrator for any entity, `false` otherwise.

#### remove_administrator

``` rust
pub fn remove_administrator(user_action_hash: ActionHash) -> ExternResult<bool>
```
Removes an administrator from the system.

This function checks if the current agent is an administrator, ensures there will be at least one administrator left after removal, finds the link representing the administrator to be removed, and deletes it.

Returns an error if:
- The current agent is not an administrator
- Removing this administrator would leave no administrators
- Unable to find or delete the administrator link

### Status

#### create_status

``` rust
pub fn create_status(user_original_action_hash: ActionHash) -> ExternResult<Record>
```

Creates a new status entry for a user.

This function checks if the user already has a status, creates a new status entry, and links it to the "all_status" path.

Returns an error if:
- The user already has a status
- Unable to create the status entry or link

#### get_latest_status_record

``` rust
pub fn get_latest_status_record(original_action_hash: ActionHash) -> ExternResult<Option<Record>>
```

Retrieves the latest status record associated with a given original action hash.

This function follows the chain of updates to find the most recent status record.

Returns an error if:
- Unable to find links
- Unable to convert link target to ActionHash

#### get_latest_status

``` rust
pub fn get_latest_status(original_action_hash: ActionHash) -> ExternResult<Option<Status>>
```

Retrieves the latest status data associated with a given original action hash.

This function first finds the latest status record using `get_latest_status_record`, then extracts and returns the Status data from that record.

Returns an error if:
- Unable to find the latest status record
- Failed to deserialize the status data


#### get_latest_status_record_for_user

``` rust
pub fn get_latest_status_record_for_user(user_original_action_hash: ActionHash) -> ExternResult<Option<Record>>
```

Retrieves the latest status record associated with a given user profile.

This function first retrieves the status link for the user, then calls `get_latest_status_record` with that link.

Returns an error if:
- Unable to retrieve the status link
- Unable to find the latest status record

#### get_latest_status_for_user

``` rust
pub fn get_latest_status_for_user(user_original_action_hash: ActionHash) -> ExternResult<Option<Status>>
```

Retrieves the latest status data associated with a given user profile.

This function calls `get_latest_status_record_for_user`, then extracts and returns the Status data from the record.

Returns an error if:
- Unable to find the latest status record
- Failed to deserialize the status data

#### create_accepted_user_link

``` rust
pub fn create_accepted_user_link(original_action_hash: ActionHash) -> ExternResult<bool>
```

Creates a link indicating that a user has been accepted.

This function creates a link between the "accepted_users" path and the user's action hash.

Returns an error if:
- Unable to create the link

#### delete_accepted_user_link

``` rust
pub fn delete_accepted_user_link(original_action_hash: ActionHash) -> ExternResult<bool>
```

Deletes the link indicating that a user has been accepted.

This function finds the link representing the accepted user and deletes it.

Returns an error if:
- Unable to find or delete the link

#### get_accepted_users

``` rust
pub fn get_accepted_users(_: ()) -> ExternResult<Vec<Link>>
```

Retrieves all links representing accepted users in the system.

This function retrieves all links of type `AcceptedEntity` from the "accepted_users" path.

Returns an error if:
- Unable to retrieve links

#### get_all_revisions_for_status

``` rust
pub fn get_all_revisions_for_status(original_status_hash: ActionHash) -> ExternResult<Vec<Record>>
```

Retrieves all revisions of a status record.

This function uses a utility function `get_all_revisions_for_entry` to retrieve all records linked to the original status hash.

Returns an error if:
- Unable to retrieve revisions

#### update_user_status

``` rust
pub fn update_user_status(input: UpdateStatusInput) -> ExternResult<Record>
```

Updates a user's status.

This function checks if the calling agent is an administrator, updates the status entry, creates a link between the old and new status entries, removes the accepted user link if necessary, and adds it back if the new status is "accepted".

Returns an error if:
- The calling agent is not an administrator
- Unable to update the status entry or create links

#### suspend_user_temporarily

``` rust
pub fn suspend_user_temporarily(input: SuspendUserInput) -> ExternResult<bool>
```

Suspends a user temporarily.

This function calls `update_user_status` with a suspended status and a duration.

Returns an error if:
- Duration is not provided
- Unable to update the user status

#### suspend_user_indefinitely

``` rust
pub fn suspend_user_indefinitely(input: SuspendUserInput) -> ExternResult<bool>
```

Suspends a user indefinitely.

This function calls `update_user_status` with a suspended status and no duration.

Returns an error if:
- Unable to update the user status

#### unsuspend_user_if_time_passed

``` rust
pub fn unsuspend_user_if_time_passed(input: UpdateInput) -> ExternResult<bool>
```

Unsuspends a user if the suspension period has passed.

This function retrieves the latest status, checks if it's a temporary suspension, and if the current time exceeds the suspension end time, it updates the status to "accepted".

Returns an error if:
- Unable to retrieve the user's status
- Unable to update the user status

#### unsuspend_user

``` rust
pub fn unsuspend_user(input: UpdateInput) -> ExternResult<bool>
```

Unsuspends a user regardless of the current time.

This function calls `update_user_status` with an "accepted" status.

Returns an error if:
- Unable to update the user status

