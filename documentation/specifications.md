# Requests & Offers - HC/MVP Specification Document

## 1. Introduction

The Requests & Offers - HC/MVP project aims to develop a Holochain application designed to facilitate the exchange of requests and offers within the hAppenings.community. This document outlines the specifications and requirements for the development of this application, focusing on its core functionalities, technologies, and user interactions.

## 2. Objective

The primary objective of this project is to create a simple, open-source Holochain application that enables Creators, Projects, and Developers to reach out to Holochain Advocates with specific requests for support. The application will be built on Holochain, incorporating TimeBanking and Local Exchange Trading System (LETS) design ideas and potentially including a Mutual Credit Currency component in post MVP versions.

## 3. Targeted Audience

This application is specifically tailored for the participants in the Holochain Ecosystem. At hAppenings.community, we have created our own definitions of the individuals who would be participants in Requests & Offers - HC/MVP. The targeted audience includes:

- **Holochain Creators/Projects/Developers**: Individuals or groups actively involved in creating or developing projects within the Holochain ecosystem.
- **Holochain Advocates**: Individuals passionate about the Holochain technology, looking to support projects within the ecosystem.
- **HoloHosts**: Organizations or individuals hosting Holochain nodes, contributing to the network's infrastructure.

## 4. Core Features

### 4.1 User Profiles

- **Profile Creation**: Users can create and retrieve their profiles, categorized as "advocate", "developer" or "creator".
- **Profile Retrieval**: Users can retrieve their profiles on other devices using credentials.
- **Profile Linking**: Profiles can be linked to agents, organizations, requests, offers, and projects.
- **Custom Holochain Zome**: A custom zome is used for managing user profiles within the application.
- **hREA agents**: Profiles are linked to hREA agents.

### 4.2 Profile Entry

The `Profile` entry represents the profile and its associated agents within the hAppenings.community. An agent can be a single user or a device associated with a user, allowing for the sharing of profiles across multiple devices. This entry includes various fields to capture essential information about the profile, facilitating personalized experiences and targeted interactions within the community.

#### 4.2.1 Fields

- **name**: The full name of the profile.
  - **Type**: `String`
  - **Validation**: Must not be empty.
- **nickname**: A shorter version of the profile's name, often used for display purposes.
  - **Type**: `String`
  - **Validation**: Must not be empty.
- **bio**: A brief biography about the profile.
  - **Type**: `String`
  - **Validation**: Optional, but recommended for a richer user experience.
- **profile_picture**: An optional serialized image representing the profile's picture.
  - **Type**: `Option<SerializedBytes>`
  - **Validation**: Optional, but if provided, must be a valid image.
- **profile_type**: The type of profile, either 'advocate', 'developer' or 'creator'.
  - **Type**: `String`
  - **Validation**: Must be either 'advocate', 'developer' pr 'creator'.
- **skills**: A list of skills EntryHash associated with the profile.
  - **Type**: `Vec<EntryHash>`
  - **Validation**: Optional, can be initially empty.
- **email**: The profile's email address.
  - **Type**: `String`
  - **Validation**: Must be a valid email address format.
- **phone**: An optional phone number for the profile.
  - **Type**: `Option<String>`
  - **Validation**: Optional, but if provided, must be a valid phone number format.
- **time_zone**: The time zone in which the profile resides.
  - **Type**: `String`
  - **Validation**: Must be a valid time zone identifier.
- **location**: The location where the profile is based.
  - **Type**: `String`
  - **Validation**: Optional, but recommended for community engagement and networking.
- **is_admin**: A flag indicating whether the profile is an administrator or not.
  - **Type**: `bool`
  - **Validation**: Optional, defaults to `false`. A link to an `All_Admins` anchor must be created in the `Admins` zome.
- **status**: The status of the profile, either 'Pending', 'Accepted', or 'Rejected'.
  - **Type**: `String`
  - **Validation**: Must be either 'Pending', 'Accepted', or 'Rejected'.

#### 4.2.2 Links

  - **ProfileUpdates**: A link from the profile create header to the profile update headers.
  - **AllProfiles**: A link to the `profiles` anchor. It is an index of all the profiles.
  - **MyProfile**: A link from the current agent to the profile.

### 4.3 Projects and Organizations

- **Project and Organization Creation**: Users can create projects and organizations, with projects owned by organizations. Projects have specific requirements and status.
![Project status](images/project-status.png)
- **Team Members**: Projects and organizations can include team members, which are agent profiles.
- **External Repository Linking**: Projects and organizations can be linked to external repositories (e.g. GitHub).
- **Administrators**: Projects and organizations are managed by administrators. They can have "badges" to indicate their status.

#### 4.3.1 Project Entry

The `Project` entry represents a project and its associated agents, including team members. Projects have specific requirements and status. Projects can be created by organizations or by profiles.

In hREA, projects are organizations `classifiedAs` `Project`.

##### 4.3.1.1 Fields

- **name**: The name of the project.
 - **Type**: `String`
 - **Validation**: Must not be empty.
- **description**: A brief description of the project.
 - **Type**: `Option<String>`
 - **Validation**: Optional, but recommended for community engagement and networking.
 - **Default**: `None`
- **picture**: An optional serialized image representing the project's picture.
  - **Type**: `Option<SerializedBytes>`
  - **Validation**: Optional, but if provided, must be a valid image.
  - **Default**: `None`
- **status**: The status of the project, either 'Pending', 'Accepted', or 'Rejected'.
 - **Type**: `String`
 - **Validation**: Must be either 'Pending', 'Accepted', or 'Rejected'.
 - **Default**: `Pending`

##### 4.3.1.2 Links

- **AllProjects**: A link to the `projects` anchor.
- **ProjectAdministrators**: A link from the project's to a profile. It is an index of all the administrators.
- **ProjectTeamMembers**: A link from the project's to a profile. It is an index of all the team members.
- **ProjectCategories**: A link from the project's to a category. It is an index of all the categories.
- **ProjectRequests**: A link from the project's to a request. It is an index of all the requests made by the project.
- **ProjectOffers**: A link from the project's to an offer. It is an index of all the offers made to the project.

#### 4.3.2 Organization Entry

The `Organization` entry represents an organization and its associated profiles and projects. Organizations are created by profiles.

In hREA, are agents `classifiedAs` `Organization`.

##### 4.3.2.1 Fields

- **name**: The name of the organization.
 - **Type**: `String`
 - **Validation**: Must not be empty.
- **description**: A brief description of the organization.
 - **Type**: `Option<String>`
 - **Validation**: Optional, but recommended for community engagement and networking.
 - **Default**: `None`
- **picture**: An optional serialized image representing the organization's picture.
  - **Type**: `Option<SerializedBytes>`
  - **Validation**: Optional, but if provided, must be a valid image.
  - **Default**: `None`
- **status**: The status of the organization, either 'Pending', 'Accepted', or 'Rejected'.
 - **Type**: `String`
 - **Validation**: Must be either 'Pending', 'Accepted', or 'Rejected'.
 - **Default**: `Pending`

##### 4.3.2.2 Links

- **AllOrganizations**: A link to the `organizations` anchor.
- **OrganizationAdministrators**: A link from the organization's to a profile. It is an index of all the administrators of the organization.
- **OrganizationMembers**: A link from the organization's to a profile. It is an index of all the members of the organization.
- **OrganizationProjects**: A link from the organization's to a project. It is an index of all the projects under the organization.
- **OrganizationCategories**: A link from the organization's to a category. It is an index of all the categories under the organization.
- **OrganizationRequests**: A link from the organization's to a request. It is an index of all the requests made by the organization.
- **OrganizationOffers**: A link from the organization's to an offer. It is an index of all the offers made to the organization.

### 4.4 Requests and Offers

- **hREA Integration**: Utilizes hREA for managing economic activities, including tracking resources, facilitating agreements, and matching needs.
- **Request Creation**: Projects can create requests, linked to specific projects, organizations, skills, and team members.
- **Offer Creation**: Organizations and agents can create offers, linked to specific requests and projects.

### 4.5 Skills and Categories

- **Skills**: Users can create skills, which are used to filter agents profiles, requests and offers.
- **Categories**: Administrators can create categories, which are used to organize projects, requests and offers.

![Types of project](images/types-of-projects.png)

![Types of support requested](images/types-of-support-requested.png)

#### 4.5.1 Skill Entry

The `Skill` entry represents the skills associated with the profiles, projects, requests and offers. This in an anchor that contains a `String`. `Profiles` are linked to `Skills`.

Skills are also linked to hREA Resource Specifications.

### 4.6 Search Functionality

Each page has a search functionality.

- **Search Profiles**: Users can search profiles by name, skills, categories, location, organizations and projects.
- **Search Organization**: Users can search organizations by name, categories, projects.
- **Search Project**: Users can search projects by name, skills, categories and organizations.
- **Search Requests**: Users can search requests by name, skills, categories, projects, organizations and profiles.
- **Search Offers**: Users can search offers by name, skills, categories, projects, organizations and profiles.

### 4.7 Administrator and Moderation Functionalities

- **Request and Offer Management**: Administrators manage requests and offers.
- **Project and Organization Management**: Administrators manage projects and organizations.
- **Agent Profile Management**: Administrators manage agent profiles, including verification processes.
- The first agent that initiate the network should be an administrator.
- Administrators needs a special access to the `Administration` zome and ui.
- Utilisation of hREA roles for project management and organization management.
- Utilisation of [capability-based Holochain security](https://developer.holochain.org/concepts/8_calls_capabilities/#how-to-secure-functions-against-unauthorized-use).


## 5. MVP Use Case: Project Collaboration and Skill Matching

### 5.1 User Registration and Profiles

- **Use Case**: Users can register and create profiles, including their skills and areas of expertise.
- **Benefit**: Facilitates the creation of a user-centric community, enabling personalized experiences and targeted interactions.

### 5.1.1 Profile Retrieval

- **Use Case**: Users can retrieve their profiles, including their skills and areas of expertise.
- **Benefit**: Facilitates the creation of a user-centric community, enabling personalized experiences and targeted interactions. It allows the user to link multiple agents/devices to their profile.

### 5.2 Project Creation

- **Use Case**: Users can create projects, specifying the skills needed and the scope of the project.
- **Benefit**: Allows for the organization and management of projects, ensuring that the right skills are matched with the right projects.

### 5.3 Request Creation

- **Use Case**: Users can create requests for specific skills or resources needed for their projects. These requests can be linked to specific projects, organizations, skills, and team members.
- **Benefit**: Provides a structured way for users to express their needs, ensuring that the right offers are matched with their requests. This functionality supports the efficient allocation of resources and skills within the community.

### 5.4 Offer Creation

- **Use Case**: Users with relevant skills can create offers to contribute to projects, specifying the skills they are offering and how they intend to contribute.
- **Benefit**: Enables direct matching of skills with project needs, facilitating efficient collaboration.

### 5.5 Request and Offer Management

- **Use Case**: Users can manage their requests and offers, including accepting offers from other users.
- **Benefit**: Provides a structured way for users to engage with each other, ensuring that interactions are organized and manageable.

### 5.6 Basic Search Functionality

- **Use Case**: Users can search for requests, offers, projects, organizations, profiles by name, skills, categories, organizations and projects.
- **Benefit**: Enhances the discoverability of resources within the community, promoting collaboration and innovation.

## 6. Infrastructure

### 6.1 Holo Hosting

- **Holo Hosting Overview**: Leverages HoloHosts for robust and scalable infrastructure, contributing to the network's infrastructure and enhancing performance and reliability.
- **Hosting Requirements**: Requires a distributed network of HoloHosts for high availability and redundancy. The Holo Network can supply multiple HoloHosts for redundancy.
- **Hosting Benefits**: Fosters a decentralized and resilient infrastructure, aligning with Holochain ecosystem principles.

## 7. Technologies

- **Holochain**: Core technology for building the application, ensuring local-first and peer-to-peer network capabilities.
- **SvelteKit**: Utilized for the guest/front-end, providing a modern and efficient framework for web development.
  - **Skeleton UI**: A component library for building user interfaces with SvelteKit and Tailwind. 
- **hREA**: hREA (Holochain Resource-Event-Agent) is an implementation of the Valueflows specification. It enables a transparent and trusted account of resource and information flows between decentralized and independent agents, across and within ecosystems.

## 8. User Interface

Color palette :

![hAppening Community color palette](images/happening-community-theme-1.png)

![hAppening Community color palette](images/happening-community-theme-2.png)

## 9. Conclusion

This specification document outlines the key components and functionalities of the Requests & Offers - HC/MVP project. By adhering to these specifications, developers can ensure the successful creation of a Holochain application that effectively facilitates the exchange of requests and offers within the hAppenings.community.
