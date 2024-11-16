# hREA Integration Specification

## Overview

This document details the integration of hREA (Holochain Resource-Event-Agent) within the Requests & Offers application. hREA provides the foundation for managing economic flows, resource tracking, and agent relationships in our Holochain-based system.

## Economic Flow Model

The application implements the following hREA economic flow:

```
Intent -> Proposal -> Agreement -> Commitment -> Economic Event
```

Each step serves a specific purpose:
- `Intent`: Initial expression of need or offer
- `Proposal`: Formalized request or offer
- `Agreement`: Mutual acceptance between parties
- `Commitment`: Confirmed obligation to fulfill
- `Economic Event`: Actual fulfillment record

For MVP simplicity, we merge Intent and Proposal in the user experience while maintaining the underlying hREA structure.

## Core Components Integration

### 1. Agent Management

#### User Profiles
- Implemented as hREA Person agents
- Custom profile zome for user management
- Direct integration with hREA agent relationships
- Multi-device profile support through agent linking

#### Organizations
- Mapped to hREA Organization agents
- Organization profiles managed through profile zome
- Supports project and team management
- Handles resource and proposal relationships

### 2. Resource System

#### Skills Management
- Skills implemented as hREA Resource Specifications
- Associated with offers/requests through Intents
- Enables skill matching and tracking
- Supports skill categorization and search

#### Categorization
- Uses hREA's `classifiedAs` property
- Provides hierarchical organization
- Enables filtered searching
- Supports multiple classification types

### 3. Project Structure

#### Project Implementation
- Projects are Organizations with `classifiedAs` "Project"
- Managed by parent organizations
- Supports team member relationships
- Tracks project-specific resources and proposals

### 4. Exchange System

#### Requests and Offers
- Implemented as hREA Proposals
- Single Intent philosophy for simplicity
- Supports:
  - Resource specification
  - Category classification
  - Agent relationships
  - Status tracking

#### Exchange Flow
1. User creates request/offer (Intent/Proposal)
2. System enables matching
3. Parties reach agreement
4. Commitments are recorded
5. Fulfillment is tracked

### 5. Access Control

#### Permission Management
- Utilizes Holochain capability tokens
- Integrates with hREA agent relationships
- Supports:
  - Administrative functions
  - Role-based access
  - Moderation capabilities

### 6. Search and Discovery

#### Query Implementation
- Leverages hREA's GraphQL capabilities
- Enables comprehensive searching across:
  - Offers and requests
  - Skills and categories
  - Projects and organizations
  - Agent profiles

## Technical Implementation Details

### Data Structure

#### Link Types
- Agent-to-Agent relationships
- Resource associations
- Project connections
- Proposal linkages
- Category classifications

#### Anchor System
- Global indexes for major entities
- Relationship tracking
- Status management
- Search optimization

### Performance Considerations

1. **Query Optimization**
   - Efficient GraphQL implementation
   - Strategic use of indexes
   - Optimized search patterns

2. **Data Management**
   - Structured relationship handling
   - Efficient state tracking
   - Scalable storage approach

## Future Enhancements

### Planned Extensions
1. Advanced matching algorithms
2. Enhanced commitment tracking
3. Complex resource management
4. Extended economic event logging

### Integration Opportunities
1. Additional hREA capabilities
2. Enhanced querying features
3. Advanced reporting tools
4. Extended classification systems