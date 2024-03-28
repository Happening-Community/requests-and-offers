# Requests & Offers - hREA Mapping Document

This document details the integration of hREA (Holochain Resource-Event-Agent) concepts within the Requests & Offers - HC/MVP application, focusing on economic flow management.

## hREA Flux Integration

The application's economic flow adheres to the hREA flux model:

`Intent` -> `Proposal` -> `Agreement` -> `Commitment`

This structured approach ensures efficient management of economic activities from initial interest to final commitment.

**[Sacha]** Based on the diagram at the bottom of the page, I suggest this new sequence: `Commitment` satisfies `Intent`, `Economic event` fills `Commitment` or sastifies `Intent`.

**[Lynn]** What is Flux, and what are you using it for in the app?

**[Sacha]** By flux, I meant the hREA base logic, for having an idea of how the core concepts works together. I should rename this section into something like `Base hREA model`.

## Core Features Mapping

### User Profiles

- **hREA Concept**: Person agents
- **Mapping**: User profiles map to Person agents in hREA. Agent relationships, including linking profiles to organizations, requests, offers, and projects, are managed by a custom zome within the application. This zome supports profile retrieval and facilitates agent relationship tracking, laying the groundwork for hREA integration.
- **[Lynn]** Agent relationship just link agents to other agents. The requests and offers links to agents are already in hREA.
- **[Sacha]** Ok, I'll clean it it the new version of the documentation.
- **[Mar 27 mtg]** Let's discuss the way holochain does its permissions (object capabilities etc.), and see how that fits with agent relationships.  We'll want to lean towards the holochain permissions as much as possible.
- **[Sacha]** Okay, let's talk about it at the next meeting. In the meantime, here's the official documentation about [calls and capabilities] (https://developer.holochain.org/concepts/8_calls_capabilities/).

### Skills

- **hREA Concept**: Resources
- **Mapping**: Skills are classified as resources in hREA, enabling their tracking and management. They are associated with user profiles, projects, requests, and offers.
- **[Lynn]** Skills are Resource Specifications.  I think they should probably be associated only with requests and offers, the others would be some kind of duplication.
- **[Sacha]** Okay, I'll correct it in the new version. Are profiles still associated with user skills?
- **[Lynn]** In hREA, this is done through offers (Intents), instead of a direct association.  But let's discuss and make sure that is the best way.

### Categories

- **hREA Concept**: Resource Specification
- **Mapping**: Categories map to Resource Specifications in hREA, facilitating resource classification and organization.
- **[Lynn]** I think categories would map to the classifiedAs properties in hREA, but let's discuss.

### Projects

- **hREA Concept**: Resource Specification
- **Mapping**: Projects are considered Resource Specifications in hREA, representing one or many deliverable resources.
- **[Lynn]** Projects will be either Organizations or Plans in hREA.  A Plan has deliverables.  But Plans might over-complexify things, not sure.  I'd like to look at examples and better understand what projects are.  Let's all discuss this some more.
- **[Mar 27 mtg]** Projects will be Organizations (classifiedAs a Project).  Projects can have members, just like Organizations.  Projects will be managed by an Organization.  We may need resource created etc. later, depending on where the app goes beyond the offers/requests/matching.
- **[Sacha]** The Holochain's capabilities tokens will surely be usefull for managing the authorizations for managing Projects and Organizations.

### Organizations

- **hREA Concept**: Organization agents
- **Mapping**: Organizations map to Organization agents in hREA, enabling their tracking and management. As for the user profiles, a custom organization zome is used within the application for managing organization relationships with resources, projects, and proposals.
- **[Lynn]** I'm not sure we need a custom organization zome, there should be one already. But if we decide projects are agents, then yes, we'll want something new for agent relationships, although I hope it could be in the same zome (?).
- **[Sacha]** Yes, it's possible in the same zome. Zomes are modules. If we think of organizations as agents with an organization profile, it would make sense to do it in the `profile` zome. It would simply be another type of entry.

### Requests and Offers

- **hREA Concept**: Proposals
- **Mapping**: Requests and offers are treated as Proposals in hREA, facilitating their tracking and management as proposals within the network.
- **[Mar 27 mtg]** There will only one Intent ("buy nothing" philosophy).  We will merge the Intent and Proposal for the UX, to keep things simple.
- **[Sacha]** Ok, for the MVP we can use only `intents` and then we can see how to make the system more precise.

### Administrator and Moderation Functionalities

- **hREA Concept**: Governance
- **Mapping**: Administrator and moderation functionalities map to hREA's Governance capabilities, allowing for the management of network economic activities and policy enforcement.
- **[Lynn]** I don't think hREA has anything for permissions.  Could be done by roles (like administrator or moderator).
- **[Sacha]** I know Holochain has a `capability token` feature to manage zome call permissions. We could use it in a custom administration zome in addition to hREA roles.
- **[Lynn]** Yes, let's use what holochain uses, and adapt hREA to that in the simplest way so it doesn't duplicate anything.

### Search Functionality

- **hREA Concept**: Querying
- **Mapping**: The search functionality leverages hREA's GraphQL querying capabilities, enabling efficient searching of resources, agents, projects, and proposals within the network.
- **[Lynn]** Do we need search on anything besides offers and requests?  (Forgive me if I don't remember the original requirements well enough.)
- **[Sacha]** In the specification file, the search functionality is quite comprehensive. It allows the user to search by name, skills, project, organization or categories, and should display anything related to the filtered fields. For the MVP, we can start with something more basic, but ideally I think we should have the most comprehensive search function possible to optimize the matching process.
- **[Lynn]** Agree, we want to satisfy all the requirements.  Let's see if everything we need is in the offers/requests, or can be found through the offers/requests, and if that is simpler to code or not.  Also I have some questions on the UX in this regard, as hREA has the ability for agents to keep "intents" for themselves, and publish those out as offers/requests ("proposals") as needed, at different times, different reciprocity, etc.  So I wonder if we want to make use of that, or not, it might just add complexity for not that much user benefit, let's discuss.
- **[Mar 27 mtg]** There may be different search on different pages, we will see.  I think I understood that if a project or organization is returned, it would also return the open offers/requests.  I think that once the pages for organizations, projects, offers, requests are done, we could address search more carefully.
- **[Sacha]** Regarding private intentions, I think it could be useful to "bookmark" users' interests. Users could save skills, projects, organizations, requests and offers that interest them and access them privately (and publish some of them too?). I think this could be a whole new feature, in addition to the search functionality. Maybe we should save that for after the MVP if Sam and Anita find the idea interesting.

## Intents and Commitments

- **hREA Concept**: Intents and Commitments
- **Mapping**: Intents and commitments map to hREA's Commitments capabilities, enabling users to express varying levels of commitment to resources, projects, requests, offers, or organizations.
- **[Mar 27 mtg]** We will want to support Commitments at some point, but let's get more specific after the requests/offers are done.

## Questions for Further Exploration

- How can intents enhance the matching process for resources, agents, projects, and proposals? 
  - **[Lynn]** I think we would use intents (the primary intent of each proposal) to do the matching, nothing else is needed. Each primary intent knows the agent making the offer or request.  It also knows the resource specification, and the classifications (categories; and do we need multiple resource specifications for skills?).  So it would match on category and resource specification basically.
- How do commitments and intents interact to ensure the network's economic flow?  
  - **[Lynn]** A commitment "satisfies" an intent.  So if we want to (but we don't have to) record the commitment(s), we would create that relationship.  And at the same time, the user could mark the intent "finished" if the commitment fully satisfies the intent and they don't want it published any more.
- How can projects and organizations negotiate agreements using intents, requests, and offers? 
  - **[Lynn]** If there are 2 (or more) related commitments that satisfy intents (usually a primary and a reciprocal one, like you will work for 6 months and I will pay you $50/hour in reciprocity for your work), then those are tied together by an agreement.  (I don't know how much of this should be in the app.)  The other part of your question might be do we support the communication around coming to an agreement.  That isn't in hREA, but could be a separate chat app that we could integrate, or could be done outside the app thru email etc.
- Can intents target specific skills or categories to express special interest or project preferences?  
  - **[Lynn]** Yes, they almost always would do that, either or both.
- How can hREA manage the governance and administration of the network? 
  - **[Lynn]** hREA doesn't include permissions itself, but they can be added based on agent relationship roles, if we implement that part.
- How to distinguish between Categories and Skills Resource Specifications? 
  - **[Lynn]** If people will list only one skill per intent/proposal, then the skill is a resource specification (Intent.resourceConformsTo), and the categories are classifications (Intent.resourceClassifiedAs)
- How can Projects' deliverable Resources be expressed as proposals, intents, and commitments? 
  - **[Lynn]** This might depend on what a project is in hREA, and if the deliverable is promised by the developer, or if the deliverable is the output, which will be delivered by the whole team.  But generally a deliverable is a commitment that references a resource specification for the deliverable.  Then when it is delivered, there is an economic event that fulfills that commitment and creates an economic resource that conforms to the resource specification.

## Diagrams

![offers-reqs-mvp](https://github.com/Happening-Community/requests-and-offers/assets/3776081/ec3b9d25-f3c5-44f2-89de-48925e3c52a9)