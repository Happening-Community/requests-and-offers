# Requests & Offers - HC/MVP Specification Document

##   1. Introduction

The Requests & Offers - HC/MVP project aims to develop a Holochain application designed to facilitate the exchange of requests and offers within the hAppenings.community. This document outlines the specifications and requirements for the development of this application, focusing on its core functionalities, technologies, and user interactions.

##   2. Objective

The primary objective of this project is to create a simple, open-source Holochain application that enables Creators, Projects, and Developers to reach out to Holochain Advocates with specific requests for support. The application will be built on Holochain, incorporating TimeBanking/LETS design ideas and potentially including a Mutual Credit Currency component.

##   3. Targeted Audience

This application is specifically tailored for the participants in the Holochain Ecosystem. At hAppenings.community, we have created our own definitions of the individuals who would be participants in Requests & Offers - HC/MVP. The targeted audience includes:

- **Holochain Creators/Projects/Developers**: Individuals or groups who are actively involved in creating or developing projects within the Holochain ecosystem.
- **Holochain Advocates**: Individuals who are passionate about the Holochain technology and are looking to support projects within the ecosystem.
- **HoloHosts**: Organizations or individuals who host Holochain nodes and contribute to the network's infrastructure.

##   4. Core Features

###   4.1 User Profiles

- **Profile Creation and Retrieval**: Users can create and retrieve their profiles, which can be categorized as "enthusiast" or "developer".
- **Profile Linking**: Profiles can be linked to organizations, requests, and projects.
- **Custom Holochain Zome**: The profile zome is a custom zome designed specifically for managing user profiles within the application.

###   4.2 Projects and Organizations

- **Project and Organization Creation**: Users can create projects and organizations. Projects can be owned by organizations, and organizations can create projects.
- **Team Members**: Projects and organizations can include team members, which are the agent profiles.
- **External Repository Linking**: Projects and organizations can be linked to external repositories.

###   4.3 Requests and Offers

- **hREA Integration**: The application will utilize hREA for managing the economic flow of requests and offers. hREA is a comprehensive suite designed to facilitate the management of various economic activities within decentralized and independent networks. It includes several key components such as the Agent Kit, Plan Kit, Agreement Kit, Observation Kit, Planning Kit, and Proposal Kit, each serving specific functions within the economic ecosystem. By integrating hREA, the application can track and manage resources, facilitate agreements, coordinate actions, and match needs, ensuring a transparent, trusted, and efficient economic flow.
- **Request Creation**: Projects can create requests.
- **Offer Creation**: Organizations and agents can create offers.
- **Linking Offers to Requests and Projects**: Offers can be linked to specific requests and projects.

###   4.4 Administrator and Moderation Functionalities

- **Request and Offer Management**: Administrators can manage requests and offers.
- **Project and Organization Management**: Administrators can manage projects and organizations.
- **Agent Profile Management**: Administrators can manage agent profiles, including verification processes.

##   5. Technologies

- **Holochain**: The core technology for building the application, ensuring local-first and peer-to-peer network capabilities.
- **SvelteKit**: Utilized for the guest/front-end, providing a modern and efficient framework for web development.
- **hREA**: A comprehensive suite for managing economic activities within decentralized networks, including components for tracking individuals, creating operational schedules, handling market exchanges, tracking resource movements, coordinating actions, and matching outcomes.

##   6. Conclusion

This specification document outlines the key components and functionalities of the Requests & Offers - HC/MVP project. By adhering to these specifications, developers can ensure the successful creation of a Holochain application that effectively facilitates the exchange of requests and offers within the hAppenings.community.
