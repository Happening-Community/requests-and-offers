## Architecture

### Profile zome

The profile zome give metadata to the agents, links many agents to a profiles and allow user to retrieve a profile with a new agent.

These types are three entry types in the DHT, one for each type of member :
- Individual Profiles
- Project Profiles
- Organization Profiles

#### Individual Profiles

```rust
enum Types {
    Advocate
    Developer
}

struct IndividualProfile {
    name: String
    nickname: String
    profile_picture: Vec<u8> // validation: must be a valid image
    bio: String
    type: Type
    skills: Vec<String>
    email: String // validation: must be a valid email
    phone: Option<String>
    time_zone: String // validation: must be a valide time zone
    location: String
}

enum Links {
    IndividualToOrganization
    IndividualToProject
}
```

#### Project Profiles

``` rust
struct ProjectProfile {
    name: String
    description: String
    logo: Vec<u8> // validation: must be a valid image
    website_url: String // validation: must be a valid URL
    github_url: String // validation: must be a valid URL
    type: String // enum to define
    status: String // enum to define
    team_members: Vec<IndividualProfileHash>
}
```

#### Organization Profiles

``` rust
struct OrganizationProfile {
    name: String
    description: String
    logo: Vec<u8> // validation: must be a valid image
    website_url: String // validation: must be a valid URL
    type: String // enum to define
    year_established: String // validation: must be a valid year
    team_members: Vec<IndividualProfileHash>
}

enum Links {
    OrganizationToProject
}
```

#### Know Your Costumer (KYC)

A basic KNY protocol will be necessary to avoid spam and fake accounts.

#### Retrieve Account

DeepKey could be a solution for managing multiple agents per individual profiles.

## Requests and Offers system with hREA