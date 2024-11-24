# Current Task: Organizations Features Implementation

## Missing Features to Implement

### 1. Service Layer (`/services/zomes/organizations.service.ts`)
- [x] Missing Methods
  - [x] `updateOrganization(hash, updates)` => `update_organization` in zome
  - [x] `deleteOrganization(hash)` => `delete_organization` in zome
  - [x] `leaveOrganization(hash)` => `leave_organization` in zome
  - [x] `isOrganizationCoordinator(orgHash, userHash)` => `is_organization_coordinator` in zome

### 2. UI Components
- [x] MemberManagementModal (`/lib/modals/MemberManagementModal.svelte`)
  - [x] List view of current members with roles
  - [x] Add/remove member functionality
  - [x] Permission validation
  - [x] Proper cleanup on unmount
  - [x] Form validation for member actions
  
- [x] OrganizationMembersTable (`/lib/tables/OrganizationMembersTable.svelte`)
  - [x] Member list with role indicators
  - [x] Action buttons based on user permissions
  - [x] Status indicators
  - [x] ARIA labels for accessibility
  - [x] Reactive state management

- [x] OrganizationCoordinatorsTable (`/lib/tables/OrganizationCoordinatorsTable.svelte`)
  - [x] Coordinator management interface
  - [x] Permission-based actions
  - [x] Status indicators
  - [x] ARIA labels for accessibility
  - [x] Reactive state management

### 3. Store Updates (`/stores/organizations.store.svelte.ts`)
- [x] Organization Management
  - [x] `updateOrganization(hash, updates)`: Update org details and refresh UI
  - [x] `deleteOrganization(hash)`: Remove org and update lists
  - [x] `getOrganizationStatus(hash)`: Get and cache status

- [x] Member Management
  - [x] `addMember(orgHash, memberHash)`: Add member and update lists
  - [x] `removeMember(orgHash, memberHash)`: Remove member and update UI
  - [x] `getMembers(orgHash)`: Get and cache member list
  - [x] `leaveOrganization(orgHash)`: Leave and update UI state

- [x] Coordinator Management
  - [x] `addCoordinator(orgHash, coordHash)`: Add coordinator and update lists
  - [x] `removeCoordinator(orgHash, coordHash)`: Remove and update UI
  - [x] `getCoordinators(orgHash)`: Get and cache coordinator list
  - [x] `isCoordinator(orgHash, userHash)`: Check coordinator status using service

### 4. Routes Updates
- [ ] Organization Details Page (`/routes/(app)/organizations/[id]/+page.svelte`)
  - [ ] Members management section with MemberManagementModal
  - [ ] Coordinators management section with role-based actions
  - [ ] Settings section for coordinators only
  - [ ] Centralized error display using Skeleton UI alerts
  - [ ] Consistent loading states with Skeleton UI loaders

- [ ] User Profile Page (`/routes/(app)/user/+page.svelte`)
  - [ ] List of joined organizations with roles
  - [ ] Organizations where user is coordinator
  - [ ] Centralized error display
  - [ ] Consistent loading states

### 5. Types Updates (`/types/ui.ts`)
- [ ] Add OrganizationRole enum
  ```typescript
  export enum OrganizationRole {
    Member = 'member',
    Coordinator = 'coordinator',
  }
  ```

## Implementation Guidelines
- [x] Use Svelte 5 runes (`$state()`, `$derived()`) for reactivity
- [x] Implement loading states with Skeleton UI components
- [x] Add centralized error handling with user-friendly messages
- [x] Use `Promise.allSettled()` for resilient operations
- [x] Run `bunx sv check` frequently to maintain type safety
- [x] Follow responsive design principles
- [x] Create modular, reusable components

## Development Order
1. [x] Update types first to enable proper type checking
2. [x] Implement missing service methods
3. [x] Add store methods with proper error handling
4. [x] Create UI components following patterns
5. [ ] Update routes with new components
