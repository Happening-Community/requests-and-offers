# Requests & Offers - hREA Mapping Document

This document details the integration of hREA (Holochain Resource-Event-Agent) concepts within the Requests & Offers - HC/MVP application, focusing on economic flow management.

## hREA Flux Integration

The application's economic flow adheres to the hREA flux model:

`Intent` -> `Proposal` -> `Agreement` -> `Commitment`

This structured approach ensures efficient management of economic activities from initial interest to final commitment.

## Core Features Mapping

### User Profiles

- **hREA Concept**: Person agents
- **Mapping**: User profiles map to Person agents in hREA. Agent relationships, including linking profiles to organizations, requests, offers, and projects, are managed by a custom zome within the application. This zome supports profile retrieval and facilitates agent relationship tracking, laying the groundwork for hREA integration.

### Skills

- **hREA Concept**: Resources
- **Mapping**: Skills are classified as resources in hREA, enabling their tracking and management. They are associated with user profiles, projects, requests, and offers.

### Categories

- **hREA Concept**: Resource Specification
- **Mapping**: Categories map to Resource Specifications in hREA, facilitating resource classification and organization.

### Projects

- **hREA Concept**: Resource Specification
- **Mapping**: Projects are considered Resource Specifications in hREA, representing one or many deliverable resources.

### Organizations

- **hREA Concept**: Organization agents
- **Mapping**: Organizations map to Organization agents in hREA, enabling their tracking and management. As for the user profiles, a custom organization zome is used within the application for managing organization relationships with resources, projects, and proposals.

### Requests and Offers

- **hREA Concept**: Proposals
- **Mapping**: Requests and offers are treated as Proposals in hREA, facilitating their tracking and management as proposals within the network.

### Administrator and Moderation Functionalities

- **hREA Concept**: Governance
- **Mapping**: Administrator and moderation functionalities map to hREA's Governance capabilities, allowing for the management of network economic activities and policy enforcement.

### Search Functionality

- **hREA Concept**: Querying
- **Mapping**: The search functionality leverages hREA's GraphQL querying capabilities, enabling efficient searching of resources, agents, projects, and proposals within the network.

## Intents and Commitments

- **hREA Concept**: Intents and Commitments
- **Mapping**: Intents and commitments map to hREA's Commitments capabilities, enabling users to express varying levels of commitment to resources, projects, requests, offers, or organizations.

## Questions for Further Exploration

- How can intents enhance the matching process for resources, agents, projects, and proposals?
- How do commitments and intents interact to ensure the network's economic flow?
- How can projects and organizations negotiate agreements using intents, requests, and offers?
- Can intents target specific skills or categories to express special interest or project preferences?
- How can hREA manage the governance and administration of the network?
- How to distinguish between Categories and Skills Resource Specifications?
- How can Projects' deliverable Resources be expressed as proposals, intents, and commitments?
