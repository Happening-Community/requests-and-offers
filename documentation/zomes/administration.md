# Administration Zome

## 1. Introduction

The Administration Zome is a crucial component of the Requests and Offers Holochain application. It provides functionality for managing administrators and entity statuses within the system.

## 2. Zome Integrity

The Administration Zome implements several integrity functions to ensure data consistency and security:

### Entry Types

The zome defines one main entry type, `Status`, which represents a entity's status with various attributes such as status type, reason, and suspension time.

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
  AllStatuses,
  Entitiestatus,
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
pub fn register_administrator(input: EntityActionHashAgents) -> ExternResult<bool> 
```

Registers a entity as an administrator for a specific entity.

This function received 3 arguments :
- `entity` that is a `string` that is the name of the entity
- `entity_original_action_hash` that is a `ActionHash` of the entity
- `agent_pubkeys` that is an array of `AgentPubKey`

It checks if the entity is already an administrator for the entity. If not, it creates a `AllAdministrators` link between the entity's `administrators` path and the entity's action hash, and creates `AgentAdministrators` links for each agent in the `agent_pubkeys` array.

Returns `Ok(true)` if successful, or an error if:
- The entity is already an administrator for the entity

The `register_administrator` is temporarily used to manually add the first administrator. In the future, its logic will be moved to the `add_administrator` function and the first administrator will be registered using the `progenitor` pattern. `register_administrator` must be secured to ensure that it cannot be called by anyone other than the first administrator.

#### add_administrator

``` rust
pub fn add_administrator(input: EntityActionHashAgents) -> ExternResult<bool>
```
Adds a new administrator to the system for a specific entity.

This function take the same `EntityActionHashAgents` input as `register_administrator`.

It checks if the calling agent is already an administrator for the entity using `check_if_entity_is_administrator` function. If so, it calls `register_administrator` to add the new administrator.

Returns `Ok(true)` if successful, or an error if:
- The calling agent is not an administrator for the entity

#### get_all_administrators_links

``` rust
pub fn get_all_administrators_links(entity: String) -> ExternResult<Vec<Link>>
```

Retrieves all links representing administrators for a specific entity in the system.

This function received 3 arguments :
- `entity` that is a `string` that is the name of the entity
- `entity_original_action_hash` that is a `ActionHash` of the entity
- `agent_pubkeys` that is an array of `AgentPubKey`

Returns an error if:
- Unable to retrieve links

#### check_if_entity_is_administrator

``` rust
pub fn check_if_entity_is_administrator(input: EntityWithActionHash) -> ExternResult<bool>
```

Checks if the given entity is an administrator.

This function take 2 arguments:
- `entity` that is a `string` that is the name of the entity
- `entity_original_action_hash` that is a `ActionHash` of the entity


It checks if there are any links of type `AgentAdministrators` associated with the agent's public key.

Returns `true` if the agent is an administrator for any entity, `false` otherwise.

#### check_if_agent_is_administrator

``` rust
pub fn check_if_agent_is_administrator(input: EntityActionHash) -> ExternResult<bool>
```

Checks if the given agent is an administrator.

This function take 2 arguments:
- `entity` that is a `string` that is the name of the entity
- `agent_pubkey` that is a `AgentPubKey` of the agent


It checks if there are any links of type `AgentAdministrators` associated with the agent's public key.

Returns `true` if the agent is an administrator for any entity, `false` otherwise.

#### remove_administrator

``` rust
pub fn remove_administrator(input: EntityActionHashAgents) -> ExternResult<bool>
```
Removes an administrator from the system.

This function takes 3 arguments:
- `entity` that is a `string` that is the name of the entity
- `entity_original_action_hash` that is a `ActionHash` of the entity
- `agent_pubkeys` that is an array of `AgentPubKey`

This function checks if the current agent is an administrator, ensures there will be at least one administrator left after removal, finds the link representing the administrator to be removed, and deletes it.

Then, it get the `AgentAdministrators` links for all the agents public keys in the `agent_pubkeys` array, and deletes them as well.

Returns an error if:
- The current agent is not an administrator
- Removing this administrator would leave no administrators
- Unable to find or delete an administrator link

### Status

#### create_status

``` rust
pub fn create_status(input: EntityActionHash) -> ExternResult<Record>
```

Creates a new status entry for an entity.

This function take 2 arguments:
- `entity` that is a `string` that is the name of the entity
- `entity_original_action_hash` that is a `ActionHash` of the entity

It checks if the entity already has a status, creates a new status entry, and links it to the `<entity>.status` path with a `AllStatuses` link. It also create a `Entitiestatus` link from the entity original action hash to the new status original action hash.

Returns an error if:
- The entity already has a status
- Unable to create the status entry or link

#### get_latest_status_record

``` rust
pub fn get_latest_status_record(original_action_hash: ActionHash) -> ExternResult<Option<Record>>
```

Retrieves the latest status record associated with a given original action hash.

This function follows the chain of updates using the `StatusUpdates` link to find the most recent status record.

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


#### get_latest_status_record_for_entity

``` rust
pub fn get_latest_status_record_for_entity(
  input: EntityActionHash,
) -> ExternResult<Option<Record>> 
```

Retrieves the latest status record associated with a given entity.

This function takes 2 arguments:
- `entity` that is a `string` that is the name of the entity
- `entity_original_action_hash` that is a `ActionHash` of the entity

It first retrieves the status link for the entity using the `Entitiestatus` link, then calls `get_latest_status_record` with that link.

Returns an error if:
- Unable to retrieve the status link
- Unable to find the latest status record


#### create_accepted_entity_link

``` rust
pub fn create_accepted_entity_link(input: EntityActionHash) -> ExternResult<bool>
```

Creates a link indicating that a entity has been accepted.

This function takes 2 arguments:
- `entity` that is a `string` that is the name of the entity
- `entity_original_action_hash` that is a `ActionHash` of the entity

It creates a `AcceptedEntity` link between the `<entity>.status.accepted` path and the entity's action hash.

Returns an error if:
- Unable to create the link

#### delete_accepted_entity_link

``` rust
pub fn delete_accepted_entity_link(input: EntityActionHash) -> ExternResult<bool>
```

Deletes the link indicating that a entity has been accepted.

This function takes 2 arguments:
- `entity` that is a `string` that is the name of the entity
- `entity_original_action_hash` that is a `ActionHash` of the entity

It finds the `AcceptedEntity` link representing the accepted entity and deletes it.

Returns an error if:
- Unable to find or delete the link

#### get_accepted_entities

``` rust
pub fn get_accepted_entities(entity: String) -> ExternResult<Vec<Link>>
```

Retrieves all links representing the accepted specified entities in the network.

This function retrieves all links of type `AcceptedEntity` from the `<entity>.status.accepted` path.

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

#### update_entity_status

``` rust
pub fn update_entity_status(input: UpdateEntityActionHash) -> ExternResult<Record>
```

Updates a entity's status.

This function takes 5 arguments:
- `entity` that is a `string` that is the name of the entity
- `entity_original_action_hash` that is a `ActionHash` of the entity
- `status_original_action_hash` that is a `ActionHash` of the status
- `status_previous_action_hash` that is a `ActionHash` of the previous status
- `new_status` that is a `Status` type.

It checks if the calling agent is an administrator, updates the status entry, creates a `StatusUpdates` link between the old and new status entries, removes the `AcceptedEntity` link if necessary, and adds it back if the new status is "accepted".

Returns an error if:
- The calling agent is not an administrator
- Unable to update the status entry or create links

#### suspend_entity_temporarily

``` rust
pub fn suspend_entity_temporarily(input: SuspendUserInput) -> ExternResult<bool>
```

Suspends a entity temporarily.

This function takes 6 arguments:
- `entity` that is a `string` that is the name of the entity
- `entity_original_action_hash` that is a `ActionHash` of the entity
- `status_original_action_hash` that is a `ActionHash` of the status
- `status_previous_action_hash` that is a `ActionHash` of the previous status
- `reason` that is a `string`
- `duration` that is a `i64` that represents the duration of the suspension

It calls `update_entity_status` with a suspended status and a duration.

Returns an error if:
- Duration is not provided
- Unable to update the entity status

#### suspend_entity_indefinitely

``` rust
pub fn suspend_entity_indefinitely(input: SuspendUserInput) -> ExternResult<bool>
```

Suspends a entity indefinitely.

This function takes 6 arguments:
- `entity` that is a `string` that is the name of the entity
- `entity_original_action_hash` that is a `ActionHash` of the entity
- `status_original_action_hash` that is a `ActionHash` of the status
- `status_previous_action_hash` that is a `ActionHash` of the previous status
- `reason` that is a `string`

It calls `update_entity_status` with a suspended status and no duration.

Returns an error if:
- Unable to update the entity status

#### unsuspend_entity_if_time_passed

``` rust
pub fn unsuspend_entity_if_time_passed(input: UpdateInput) -> ExternResult<bool>
```

Unsuspends a entity if the suspension period has passed.


This function takes 4 arguments:
- `entity` that is a `string` that is the name of the entity
- `entity_original_action_hash` that is a `ActionHash` of the entity
- `status_original_action_hash` that is a `ActionHash` of the status
- `status_previous_action_hash` that is a `ActionHash` of the previous status

It retrieves the latest status, checks if it's a temporary suspension, and if the current time exceeds the suspension end time, it updates the status to "accepted".

Returns an error if:
- Unable to retrieve the entity's status
- Unable to update the entity status

#### unsuspend_entity

``` rust
pub fn unsuspend_entity(input: UpdateInput) -> ExternResult<bool>
```

Unsuspends a entity regardless of the current time.

This function takes 4 arguments:
- `entity` that is a `string` that is the name of the entity
- `entity_original_action_hash` that is a `ActionHash` of the entity
- `status_original_action_hash` that is a `ActionHash` of the status
- `status_previous_action_hash` that is a `ActionHash` of the previous status

This function calls `update_entity_status` with an "accepted" status.

Returns an error if:
- Unable to update the entity status

