# Requests & Offers - HC/MVP Specification Document

## 1. Introduction

The Requests & Offers - HC/MVP project aims to develop a Holochain application designed to facilitate the exchange of requests and offers within the hAppenings.community. This document outlines the specifications and requirements for the development of this application, focusing on its core functionalities, technologies, and user interactions.

## 2. Objective

The primary objective of this project is to create a simple, open-source Holochain application that enables Creators, Projects, and Developers to reach out to Holochain Advocates with specific requests for support. The application will be built on Holochain, incorporating TimeBanking/LETS design ideas and potentially including a Mutual Credit Currency component.

## 3. Targeted Audience

This application is specifically tailored for the participants in the Holochain Ecosystem. At hAppenings.community, we have created our own definitions of the individuals who would be participants in Requests & Offers - HC/MVP. The targeted audience includes:

- **Holochain Creators/Projects/Developers**: Individuals or groups actively involved in creating or developing projects within the Holochain ecosystem.
- **Holochain Advocates**: Individuals passionate about the Holochain technology, looking to support projects within the ecosystem.
- **HoloHosts**: Organizations or individuals hosting Holochain nodes, contributing to the network's infrastructure.

## 4. Core Features

### 4.1 User Profiles

- **Profile Creation and Retrieval**: Users can create and retrieve their profiles, categorized as "enthusiast" or "developer".
- **Profile Linking**: Profiles can be linked to organizations, requests, offers, and projects.
- **Custom Holochain Zome**: A custom zome for managing user profiles within the application.

### 4.1.1 Profile Entity

The `Profile` entity represents the profile of an agent within the hAppenings.community. An agent can be a single user or a device associated with a user, allowing for the sharing of profiles across multiple devices. This entity includes various fields to capture essential information about the agent, facilitating personalized experiences and targeted interactions within the community.

##### 4.1.1.1 Fields

- **name**: The full name of the agent.
  - **Type**: `String`
  - **Validation**: Must not be empty.
- **nickname**: A shorter version of the agent's name, often used for display purposes.
  - **Type**: `String`
  - **Validation**: Must not be empty.
- **bio**: A brief biography about the agent.
  - **Type**: `String`
  - **Validation**: Optional, but recommended for a richer user experience.
- **profile_picture**: An optional serialized image representing the agent's profile picture.
  - **Type**: `Option<SerializedBytes>`
  - **Validation**: Optional, but if provided, must be a valid image.
- **agent_type**: The type of agent, either 'advocate' or 'developer'.
  - **Type**: `String`
  - **Validation**: Must be either 'advocate' or 'developer'.
- **skills**: A list of skills associated with the agent.
  - **Type**: `Vec<String>`
  - **Validation**: Optional, can be initially empty.
- **email**: The agent's email address.
  - **Type**: `String`
  - **Validation**: Must be a valid email address format.
- **phone**: An optional phone number for the agent.
  - **Type**: `Option<String>`
  - **Validation**: Optional, but if provided, must be a valid phone number format.
- **time_zone**: The time zone in which the agent resides.
  - **Type**: `String`
  - **Validation**: Must be a valid time zone identifier.
- **location**: The location where the agent is based.
  - **Type**: `String`
  - **Validation**: Optional, but recommended for community engagement and networking.

This detailed specification of the `Profile` entity ensures that all stakeholders have a clear understanding of the data model, its requirements, and the validation rules that govern its use. This clarity is essential for the successful development and implementation of the application.

### 4.2 Projects and Organizations

- **Project and Organization Creation**: Users can create projects and organizations, with projects owned by organizations. Projects have specific requirements and status.
![Project status](images/project-status.png)
- **Team Members**: Projects and organizations can include team members, which are agent profiles.
- **External Repository Linking**: Projects and organizations can be linked to external repositories.

### 4.3 Requests and Offers

- **hREA Integration**: Utilizes hREA for managing economic activities, including tracking resources, facilitating agreements, and matching needs.
- **Request Creation**: Projects can create requests, linked to specific projects, organizations, skills, and team members.
- **Offer Creation**: Organizations and agents can create offers, linked to specific requests and projects.

### 4.4 Administrator and Moderation Functionalities

- **Request and Offer Management**: Administrators manage requests and offers.
- **Project and Organization Management**: Administrators manage projects and organizations.
- **Agent Profile Management**: Administrators manage agent profiles, including verification processes.

### 4.5 Skills and Categories

- **Skills**: Users can create skills, which are used to filter agents profiles, requests and offers.
- **Categories**: Administrators can create categories, which are used to organize projects, requests and offers.
![Types of project](images/types-of-projects.png)
![Types of support requested](images/types-of-support-requested.png)

### 4.5 Search Functionality

- **Search by Name**: Users can search for requests, offers, projects, organizations, and agents by name.
- **Search by Skills**: Users can search for agents profiles, requests and offers by skills.
- **Search by Project or Organization**: Users can search for requests, offers, projects, organizations and agents associated with specific projects or organizations.
- **Search by Categories**: Users can search for requests, offers, projects and organizations by categories.

## 5. MVP Use Case: Project Collaboration and Skill Matching

### 5.1 User Registration and Profiles

- **Use Case**: Users can register and create profiles, including their skills and areas of expertise.
- **Benefit**: Facilitates the creation of a user-centric community, enabling personalized experiences and targeted interactions.

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

- **Use Case**: Users can search for requests, offers, projects, organizations, agents by name, skills, projects and categories.
- **Benefit**: Enhances the discoverability of resources within the community, promoting collaboration and innovation.
## 6. Infrastructure

### 6.1 Holo Hosting

- **Holo Hosting Overview**: Leverages HoloHosts for robust and scalable infrastructure, contributing to the network's infrastructure and enhancing performance and reliability.
- **Hosting Requirements**: Requires a distributed network of HoloHosts for high availability and redundancy.
- **Hosting Benefits**: Fosters a decentralized and resilient infrastructure, aligning with Holochain ecosystem principles.

## 7. Technologies

- **Holochain**: Core technology for building the application, ensuring local-first and peer-to-peer network capabilities.
- **SvelteKit**: Utilized for the guest/front-end, providing a modern and efficient framework for web development.
  - **Skeleton UI**: A component library for building user interfaces with SvelteKit and Tailwind. 
- **hREA**: hREA (Holochain Resource-Event-Agent) is an implementation of the Valueflows specification. It enables a transparent and trusted account of resource and information flows between decentralized and independent agents, across and within ecosystems.

## 8. Conclusion

This specification document outlines the key components and functionalities of the Requests & Offers - HC/MVP project. By adhering to these specifications, developers can ensure the successful creation of a Holochain application that effectively facilitates the exchange of requests and offers within the hAppenings.community.
