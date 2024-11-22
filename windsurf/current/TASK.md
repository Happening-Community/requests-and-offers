# Current Task: Organizations Features Implementation

## Missing Features to Implement

### 1. Service Layer (`/services/zomes/organizations.service.ts`)
- [ ] Missing Methods
  - [ ] `updateOrganization(hash, updates)` => `update_organization` in zome
  - [ ] `deleteOrganization(hash)` => `delete_organization` in zome
  - [ ] `leaveOrganization(hash)` => `leave_organization` in zome
  - [ ] `isOrganizationCoordinator(orgHash, userHash)` => `is_organization_coordinator` in zome

### 2. UI Components
- [ ] MemberManagementModal (`/lib/modals/MemberManagementModal.svelte`)
  - List view of current members with roles
  - Add/remove member functionality
  - Permission validation
  - Proper cleanup on unmount
  - Form validation for member actions
  
- [ ] OrganizationMembersTable (`/lib/tables/OrganizationMembersTable.svelte`)
  - Member list with role indicators
  - Action buttons based on user permissions
  - Status indicators
  - ARIA labels for accessibility
  - Reactive state management

- [ ] OrganizationCoordinatorsTable (`/lib/tables/OrganizationCoordinatorsTable.svelte`)
  - Coordinator management interface
  - Permission-based actions
  - Status indicators
  - ARIA labels for accessibility
  - Reactive state management

### 3. Store Updates (`/stores/organizations.store.svelte.ts`)
- [ ] Organization Management
  - [ ] `updateOrganization(hash, updates)`: Update org details and refresh UI
  - [ ] `deleteOrganization(hash)`: Remove org and update lists
  - [ ] `getOrganizationStatus(hash)`: Get and cache status

- [ ] Member Management
  - [ ] `addMember(orgHash, memberHash)`: Add member and update lists
  - [ ] `removeMember(orgHash, memberHash)`: Remove member and update UI
  - [ ] `getMembers(orgHash)`: Get and cache member list
  - [ ] `leaveOrganization(orgHash)`: Leave and update UI state

- [ ] Coordinator Management
  - [ ] `addCoordinator(orgHash, coordHash)`: Add coordinator and update lists
  - [ ] `removeCoordinator(orgHash, coordHash)`: Remove and update UI
  - [ ] `getCoordinators(orgHash)`: Get and cache coordinator list
  - [ ] `isCoordinator(orgHash, userHash)`: Check coordinator status using service

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
- Use Svelte 5 runes (`$state()`, `$derived()`) for reactivity
- Implement loading states with Skeleton UI components
- Add centralized error handling with user-friendly messages
- Use `Promise.allSettled()` for resilient operations
- Run `bunx sv check` frequently to maintain type safety
- Follow responsive design principles
- Create modular, reusable components

## Development Order
1. Update types first to enable proper type checking
2. Implement missing service methods
3. Add store methods with proper error handling
4. Create UI components following patterns
5. Update routes with new components
