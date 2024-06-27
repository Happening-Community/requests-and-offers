# Requests & Offers - MVP Specification Document

## 1. Introduction

The Requests & Offers - MVP project aims to develop a Holochain application designed to facilitate the exchange of requests and offers within the hAppenings.community. This document outlines the specifications and requirements for the development of this application, focusing on its core functionalities, technologies, and user interactions.

## 2. Objective

The primary objective of this project is to create a simple, open-source Holochain application that enables Creators, Projects, and Developers to reach out to Holochain Advocates with specific requests for support. The application will be built on Holochain, incorporating TimeBanking and Local Exchange Trading System (LETS) design ideas and potentially including a Mutual Credit Currency component in post MVP versions.

## 3. Targeted Audience

This application is specifically tailored for the participants in the Holochain Ecosystem. At hAppenings.community, we have created our own definitions of the individuals who would be participants in Requests & Offers - MVP. The targeted audience includes:

- **Holochain Creators/Projects/Developers**: Individuals or groups actively involved in creating or developing projects within the Holochain ecosystem.
- **Holochain Advocates**: Individuals passionate about the Holochain technology, looking to support projects within the ecosystem.
- **HoloHosts**: Organizations or individuals hosting Holochain nodes, contributing to the network's infrastructure.

## 4. Core Features

### 4.1 User Persons

- **Person Creation**: Users can create and retrieve their persons, categorized as "advocate" or "creator".
- **Person Retrieval**: Users can retrieve their persons on other devices using credentials.
- **Person Linking**: Persons can be linked to agents, organizations, requests, offers, and projects.
- **Custom Holochain Zome**: A custom zome is used for managing user persons within the application.
- **hREA agents**: Persons are linked to hREA agents.

### 4.1.1 Person Entry

The `Person` entry represents the person and its associated agents within the hAppenings.community. An agent can be a single user or a device associated with a user, allowing for the sharing of persons across multiple devices. This entry includes various fields to capture essential information about the person, facilitating personalized experiences and targeted interactions within the community.

#### 4.1.1.1 Fields

- **name**: The full name of the person.
  - **Type**: `String`
  - **Validation**: Must not be empty.
- **nickname**: A shorter version of the person's name, often used for display purposes.
  - **Type**: `String`
  - **Validation**: Must not be empty.
- **bio**: A brief biography about the person.
  - **Type**: `String`
  - **Validation**: Optional, but recommended for a richer user experience.
- **picture**: An optional serialized image representing the person's picture.
  - **Type**: `Option<SerializedBytes>`
  - **Validation**: Optional, but if provided, must be a valid image.
- **type**: The type of person, either 'advocate' or 'creator'.
  - **Type**: `String`
  - **Validation**: Must be either 'advocate' or 'creator'.
- **email**: The person's email address.
  - **Type**: `String`
  - **Validation**: Must be a valid email address format.
- **urls**: A list of URLs associated with the person.
  - **Type**: `Vec<String>`
  - **Validation**: Optional, but recommended for community engagement and networking.
  - **Default**: Empty
- **phone**: An optional phone number for the person.
  - **Type**: `Option<String>`
  - **Validation**: Optional, but if provided, must be a valid phone number format.
- **time_zone**: The time zone in which the person resides.
  - **Type**: `String`
  - **Validation**: Must be a valid time zone identifier.
- **location**: The location where the person is based.
  - **Type**: `String`
  - **Validation**: Optional, but recommended for community engagement and networking.
- **status**: The status of the person, either 'pending', 'accepted', or 'rejected'.
  - **Type**: `String`
  - **Validation**: Must be either 'pending', 'accepted', or 'rejected'.

#### 4.1.1.2 Links

  - **PersonUpdates**: A link from the person create header to the person update headers.
  - **PersonAgents**: A link from the person to an agent. It is an index of all the agents that have the person.
  - **AllPersons**: A link to the `persons` anchor. It is an index of all the persons.
  - **MyPerson**: A link from the current agent to the person.
  - **PersonRequests**: A link from the person to a request. It is an index of all the requests that have the person.
  - **PersonOffers**: A link from the person to an offer. It is an index of all the offers that have the person.
  - **PersonProjects**: A link from the person to a project. It is an index of all the projects that have the person.
  - **PersonOrganizations**: A link from the person to an organization. It is an index of all the organizations that have the person.
  - **PersonSkills**: A link from the person to a skill. It is an index of all the skills that have the person.
  
### 4.2 Projects and Organizations

- **Project and Organization Creation**: Users can create projects and organizations, with projects owned by organizations. Projects have specific requirements and status.
![Project status](images/project-stat  - **AdministratorsPerson**: A link from the `administrators` anchor to the person. It is an index of all the administrators of the network.

#### 4.2.1 Project Entry

The `Project` entry represents a project and its associated agents, including team members. Projects have specific requirements and status. Projects can be created by organizations or by persons.

In hREA, projects are organizations `classifiedAs` `Project`.

##### 4.2.1.1 Fields

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
- **urls**: A list of URLs associated with the project.
  - **Type**: `Vec<String>`
  - **Validation**: Optional, but recommended for community engagement and networking.
  - **Default**: Empty
- **status**: The status of the project, either 'pending', 'accepted', or 'rejected'.
  - **Type**: `String`
  - **Validation**: Must be either 'pending', 'accepted', or 'rejected'.
  - **Default**: `pending`

##### 4.2.1.2 Links

- **AllProjects**: A link to the `projects` anchor.
- **ProjectAdministrators**: A link from the project's to a person. It is an index of all the administrators.
- **ProjectTeamMembers**: A link from the project's to a person. It is an index of all the team members.
- **ProjectCategories**: A link from the project's to a category. It is an index of all the categories.
- **ProjectRequests**: A link from the project's to a request. It is an index of all the requests made by the project.
- **ProjectOffers**: A link from the project's to an offer. It is an index of all the offers made to the project.

#### 4.2.2 Organization Entry

The `Organization` entry represents an organization and its associated persons and projects. Organizations are created by persons.

In hREA, are agents `classifiedAs` `Organization`.

##### 4.2.2.1 Fields

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
- **urls**: A list of URLs associated with the organization.
  - **Type**: `Vec<String>`
  - **Validation**: Optional, but recommended for community engagement and networking.
  - **Default**: Empty
- **status**: The status of the organization, either 'pending', 'accepted', or 'rejected'.
  - **Type**: `String`
  - **Validation**: Must be either 'pending', 'accepted', or 'rejected'.
  - **Default**: `pending`

##### 4.2.2.2 Links

- **AllOrganizations**: A link to the `organizations` anchor.
- **OrganizationAdministrators**: A link from the organization's to a person. It is an index of all the administrators of the organization.
- **OrganizationMembers**: A link from the organization's to a person. It is an index of all the members of the organization.
- **OrganizationProjects**: A link from the organization's to a project. It is an index of all the projects under the organization.
- **OrganizationCategories**: A link from the organization's to a category. It is an index of all the categories under the organization.
- **OrganizationRequests**: A link from the organization's to a request. It is an index of all the requests made by the organization.
- **OrganizationOffers**: A link from the organization's to an offer. It is an index of all the offers made to the organization.

#### 4.2.3 Project/Organization Facilitators

Projects and Organizations facilitators are integral to the operation and governance of projects and organizations within the network. They serve as the responsibles for the management and representation of their respective projects or organizations.

##### 4.2.3.1 Onboarding and Approval

- Projects and organizations facilitators are individuals or groups designated to represent a project or organization within the network. They are onboarded and approved by the network's administrators to participate in the network, taking on the role of facilitators of projects or organizations.

##### 4.2.3.2 Project/Organization Profile

- Projects and organizations facilitators can file out their personal profiles, including their skills, location, type, etc. This profile is crucial for matching their expertise with relevant requests and offers within the network and for making offers and requests on behalf of their projects or organizations.

##### 4.2.3.3 Offers and Requests

- Projects and organizations facilitators can make offers and requests for themselves and on behalf of their projects or organizations, such as fundraising, editing support, or testing of hApp.

### 4.3 Requests and Offers

- **hREA Integration**: Utilizes hREA for managing economic activities, including tracking resources, facilitating agreements, and matching needs.
- **Request Creation**: Users can create requests, linked to specific projects, organizations and skills.
- **Offer Creation**: Organizations, projects and users can create offers, linked to specific requests and projects.
- In hREA, requests and offers are `intents` and `proposals`.
- For each exchange, there needs to be a mechanism for each party to agree that the exchange is complete. This could be integrated into the Request and Offer management sections of the application, allowing users to confirm the completion of an exchange directly within the application. This could be implemented as a confirmation step in the exchange process, ensuring that both parties have the opportunity to confirm the completion before the exchange is finalized.

### 4.4 Skills and Categories

- **Skills**: Users can create skills, which are used to filter agents persons, requests and offers.
- **Categories**: Administrators can create categories, which are used to organize projects, requests and offers.

![Types of project](images/types-of-projects.png)

![Types of support requested](images/types-of-support-requested.png)

#### 4.4.1 Skill Entry

The `Skill` entry represents the skills associated with the persons, projects, requests and offers. This in an anchor that contains a `String` that is the skill name.

In hREA, skills are Resource Specifications. They can be created only by offers and requests. A user need to create an offer that is the list of its skills to be able to display it in its profile.

#### 4.4.1.1 Links

- **AllSkills**: A link to the `skills` anchor. It is an index of all the skills.
- **SkillPersons**: A link from the skill to a person. It is an index of all the persons that have the skill.
- **SkillProjects**: A link from the skill to a project. It is an index of all the projects that have the skill.
- **SkillRequests**: A link from the skill to a request. It is an index of all the requests that have the skill.
- **SkillOffers**: A link from the skill to an offer. It is an index of all the offers that have the skill.

#### 4.4.2 Category Entry

The `Category` entry represents the categories associated with projects and offers. This in an anchor that contains a `String` that is the category name. 

The `Category` of an organization is the collection of the `Category` of its projects.

In hREA, categories are Resource Specifications `classifiedAs` `{category}`.

#### 4.4.2.1 Links

- **AllCategories**: A link to the `categories` anchor. It is an index of all the categories.
- **CategoryProjects**: A link from the category to a project. It is an index of all the projects that have the category.
- **CategoryOffers**: A link from the category to an offer. It is an index of all the offers related to the category.

### 4.5 Search Functionality

Each page has a search functionality.

- **Search Persons**: Users can search persons by name, skills, categories, location, organizations and projects.
- **Search Organizations**: Users can search organizations by name, categories, projects.
- **Search Projects**: Users can search projects by name, skills, categories and organizations.
- **Search Requests**: Users can search requests by name, skills, categories, projects, organizations and persons.
- **Search Offers**: Users can search offers by name, skills, categories, projects, organizations and persons.

### 4.6 Network Administration and Moderation Functionalities

Administrators play a pivotal role in the governance and operation of the network, ensuring its integrity, security, and alignment with the community's objectives. Their responsibilities include:

- **Verification of Persons and Organizations**: Administrators are tasked with verifying the authenticity and compliance of persons and organizations within the network. This process is crucial for maintaining the integrity of the community and ensuring that all participants are legitimate.
- **Project Creation by Verified Organizations**: Projects within the network can be directly created by verified organizations. This streamlines the project initiation process for organizations that have already been vetted by the network administrators.
- **Verification of Projects Not Managed by Verified Organizations**: In cases where a person wishes to create a project that is not managed by a verified organization, the project must undergo a verification process by the network administrators. This ensures that all projects, regardless of their management structure, meet the network's standards and objectives.
- **Moderator Role**: Administrators can delegate moderator roles to other users. Moderators can perform most administrative tasks except for managing administrators themselves. This includes moderating projects, requests, and offers, ensuring content appropriateness and community guidelines compliance.
- **Temporary Suspension**: Administrators have the authority to temporarily suspend Person profiles for a specified period. This action can be taken in response to violations of community guidelines or other misconduct.
- **Flagging System**: Users have the ability to flag organizations, projects, requests, and offers for review by network administrators. This system allows the community to signal potentially inappropriate content or activities, prompting administrative review and action as necessary.
- **Inbox**: Administrators and moderators have access to an inbox that allows them to address user concerns, inquiries, and reports efficiently using the messaging system.


Key aspects of administrator roles and access include:

- **Exclusive Access to Administration Zome and UI**: Administrators are granted special access to the `Administration` zome and user interface, enabling them to effectively carry out their duties, including the verification of persons, organizations, and projects.
- **Utilization of hREA Roles**: Administrators leverage hREA roles to manage and track their relationships with projects and organizations. This structured approach ensures a clear and efficient method for resource allocation and project coordination within the network.
- **Capability-Based Security Measures**: The network employs capability-based Holochain security measures to ensure that only authorized administrators can access and modify critical functions. This safeguards the network against unauthorized use and maintains the security of the community.

#### 4.6.1 Links

- **AdministratorsPerson**: A link from the `administrators` anchor to a person. It is an index of all the administrators of the network.
- **ModeratorsPerson**: A link from the `moderators` anchor to a person. It is an index of all the moderators of the network.

#### 4.6.2 User Interface

Administrators have access to the Administration Dashboard, a specialized part of the user interface that includes pages for managing administrators, persons, projects, organizations, requests, and offers. This dashboard also incorporates search functionality and special reports, providing administrators with comprehensive tools for network management.

Moderators have access to the same Administration Dashboard, but without the Administrators mangement page.

### 4.7 Roles & Permissions

The Requests & Offers - MVP project is designed with a focus on facilitating collaboration and resource exchange within the hAppenings.community. To ensure a structured and efficient operation, the application defines specific roles and their associated permissions. These roles are crucial for managing the network's operations, ensuring its smooth functioning, and maintaining a healthy and supportive community.

#### 4.7.1 Advocate

- **Onboarded/Approved**: Advocates are individuals passionate about the Holochain technology, looking to support projects within the ecosystem. They are onboarded and approved to participate in the network by the network's administrators.
- **Personal Profile**: Advocates must file out their personal profiles, including essential information and their areas of expertise.
- **Offers**: Advocates can offer their skills, talents, or resources to the network. This includes mentorship, brainstorming sessions, or any other form of support they wish to provide.
- **Reporting**: Advocates have access to reporting features, allowing them to view their exchanges and a general report of total exchanges for the month.

#### 4.7.2 Creator

- **Onboarded/Approved**: Creators are individuals or groups actively involved in creating or developing projects within the Holochain ecosystem. They are onboarded and approved to participate in the network by the network's administrators.
- **Personal Profile**: Creators can file out their personal profiles, including their skills, location, type, etc.
- **Offers**: Creators can make offers, including the skills and talents they wish to offer.
- **Requests**: Creators can make requests for themselves, such as mentoring, brainstorming time, or testing in the early days of their projects.
- **Reporting**: Creators can access reports on their exchanges and a general report of total exchanges for the month.

#### 4.7.3 Projects and Organizations Facilitators

- **Onboarded/Approved**: Projects and organizations facilitators are individuals or groups designated to represent a project or organization within the network. They are onboarded and approved to participate in the network.
- **Personal Profile**: Projects and organizations facilitators can file out their personal profiles, including their skills, location, type, etc.
- **Offers**: Projects and organizations facilitators can make offers, including the skills and talents they wish to offer.
- **Requests**: Projects and organizations facilitators can make requests for themselves and on behalf of their projects or organizations, such as fundraising, editing support, or testing of hApp.


#### 4.7.5 Matchmaker (Potential Future Role)

- **Description**: A role that could be added in future versions to facilitate the matching of requests and offers more efficiently.

### 4.8 Communication and Negotiation

To facilitate real-time communication and negotiation among users, the application includes a messaging system. This system enables users to discuss details, negotiate terms, and settle agreements before finalizing exchanges through the acceptance or rejection of offers or requests.

- **User-to-User Messaging**: Allows users to communicate directly with one another, facilitating negotiations and discussions related to requests and offers.
- **Messaging to Administrators**: Provides a channel for users to send messages to network administrators. This feature is accessible through an inbox within the administration panel, allowing administrators to address user concerns, inquiries, and reports efficiently.

This messaging functionality supports the dynamic interaction between users, enhancing the collaborative environment and ensuring smooth transactions within the Requests & Offers - MVP platform.

## 5. MVP Use Case: Project Collaboration and Skill Matching

### 5.1 User Registration and Person profile

- **Use Case**: Users can register and create person profile.
- **Benefit**: Facilitates the creation of a user-centric community, enabling personalized experiences and targeted interactions.

### 5.1.1 Person Retrieval

- **Use Case**: Users can retrieve their person profile, including their skills, projects, organizations, requests and offers.
- **Benefit**: Facilitates the creation of a user-centric community, enabling personalized experiences and targeted interactions. It allows the user to link multiple agents/devices to their person profile.

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

- **Use Case**: Users can search for requests, offers, projects, organizations, persons by name, skills, categories, organizations and projects.
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

This specification document outlines the key components and functionalities of the Requests & Offers - MVP project. By adhering to these specifications, developers can ensure the successful creation of a Holochain application that effectively facilitates the exchange of requests and offers within the hAppenings.community.

![requests and offers diagram](images/requests-and-offers.drawio.png)