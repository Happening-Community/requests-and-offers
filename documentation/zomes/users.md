# Users Zome

## 1. Introduction

The User Zome is a core component of the Requests and Offers Holochain application. It allows users to create and manage their profile. It also allows administrators to access the list of all users and manage their status.

## 2. Zome Integrity

The Users Zome implements several integrity functions to ensure data consistency and security:

### Entry Types

The zome defines a single entry type that represents a user Entry with various attributes such as name, nickname, bio, etc.

``` rust
pub struct User {
  /// The full name of the user.
  pub name: String,
  /// A shorter version of the user's name, often used for display purposes.
  pub nickname: String,
  /// A brief biography about the idividual.
  pub bio: String,
  /// An optional serialized image representing the user picture.
  pub picture: Option<SerializedBytes>,
  /// The type of user, either 'advocate' or 'creator'.
  pub user_type: String,
  /// A list of skills associated with the user.
  /// WARNING: This is temporary, skills will be implemented with hREA and maybe a new entry type.
  pub skills: Vec<String>,
  /// The user's email address.
  pub email: String,
  /// An optional phone number for the user.
  pub phone: Option<String>,
  /// The time zone in which the user resides.
  pub time_zone: String,
  /// The location where the user is based.
  pub location: String,
}
```

### Link Types

The zome defines four link types:

``` rust
pub enum LinkTypes {
  UserUpdates,
  AllUsers,
  MyUser,
  UserStatus,
}
```

### Validations functions

### validate_user

Validates a `User` entry:
- Ensures user type is either "advocate" or "creator"
- Checks if the picture is a valid image (when provided)
- Validates email address

#### validate_update_user

Currently allows all updates without additional validations. It still make the verification of the `validate_user` function.

#### validate_delete_user

Prevents deletion of user profiles.

## 3. Zome Coordinator

### Main functions

#### create_user

``` rust
pub fn create_user(user: User) -> ExternResult<Record>
```

Creates a new user profile.

This function creates a new user entry, adds it to the "all_users" path, links it to the creating agent, and creates a status record linked to the user.

Returns an error if:
- The agent already has a user profile
- Failed to find the newly created user record


#### get_latest_user_record

``` rust
rust pub fn get_latest_user_record(original_action_hash: ActionHash) -> ExternResult<Option<Record>>
```

Retrieves the latest user record associated with a given action hash.

This function follows the chain of updates to find the most recent user record.

Returns an error if:
- Unable to find links
- Unable to convert link target to ActionHash

#### get_latest_user

``` rust
rust pub fn get_latest_user(original_action_hash: ActionHash) -> ExternResult<User>
```

Retrieves the latest user data associated with a given action hash.

This function first finds the latest user record using `get_latest_user_record`, then extracts and returns the User data from that record.

Returns an error if:
- Unable to find the latest user record
- Failed to deserialize the user data

#### get_agent_user

``` rust
rust pub fn get_agent_user(author: AgentPubKey) -> ExternResult<Vec<Link>>
```

Retrieves all user profiles associated with a given agent public key.

This function follows the "MyUser" link type to find user records linked to the agent.

#### update_user

``` rust
rust pub fn update_user(input: UpdateUserInput) -> ExternResult<Record>
```

Updates an existing user profile.

This function checks if the current agent has permission to update the profile,
creates a new entry with the updated user data, and links it to the original profile.

Returns an error if:
- The current agent is not the original author or an administrator
- Unable to find the newly updated user record


### Users administration

#### get_all_users

``` rust
rust pub fn get_all_users(_: ()) -> ExternResult<Vec<Link>>
```

Retrieves all user profiles in the system.

This function checks if the calling agent is an administrator before proceeding.
It retrieves all links of type `AllUsers` from the root path.

Returns an error if:
- The calling agent is not an administrator

#### get_user_status_link

``` rust
rust pub fn get_user_status_link(user_original_action_hash: ActionHash) -> ExternResult<Option<Link>>
```

Retrieves the status link associated with a given user profile.

This function takes the original action hash of a user profile and returns the first link of type `UserStatus`.

Returns:
- Some(Link) if a status link is found
- None if no status link is found
- An error if unable to retrieve links