# Organization Status Management Implementation

## Overview
Add comprehensive status management features for organizations in the admin panel, matching the functionality currently available for users. This includes status transitions, history tracking, and a user-friendly interface using the ActionBar component.

## Current State
- Organizations have basic status management (pending/accepted/rejected)
- Backend functionality for full status management is already implemented in `administration.store.svelte.ts`
- UI needs to be updated to match user status management features
- OrganizationDetailsModal already exists with:
  - ActionBar integration
  - Organization details display
  - Status information display
  - Contact information section

## Required Changes

### 1. Update Organizations Page (`/admin/organizations/+page.svelte`)
- [x] Modify status categories to match users:
  - Pending Organizations
  - Accepted Organizations
  - Temporarily Suspended Organizations
  - Indefinitely Suspended Organizations
  - Rejected Organizations
- [x] Add status history link
- [x] Implement loading/error states consistent with users page
- [x] Add ConicGradient loading animation
- [x] Add retry button for loading failures

### 2. Update Organization Details Modal (`/src/lib/modals/OrganizationDetailsModal.svelte`)
- [x] Create modal component
- [x] Include ActionBar for status management
- [x] Display organization details:
  - Name
  - Description
  - Current status
  - Suspension details (if applicable)
- [ ] Add status history section
- [x] Implement status change functionality
- [ ] Add remaining suspension time display for suspended organizations

### 3. Update Organizations Table (`/src/lib/tables/OrganizationsTable.svelte`)
- [ ] Add status column
- [ ] Add "View" button to open OrganizationDetailsModal
- [ ] Display remaining suspension time for suspended organizations
- [ ] Add status-based styling (matching users table)

### 4. Create Status History Page (`/admin/organizations/status-history/+page.svelte`)
- [x] Create new page component
- [x] Reuse StatusTable component
- [x] Implement status history fetching and display
- [ ] Add filtering options (if present in users version)

## Implementation Order
1. [x] Update organizations page layout
2. [x] Update organization details modal
3. [ ] Update organizations table
4. [x] Add status history page

## Technical Notes
- All backend functionality exists in `administration.store.svelte.ts`
- Status types are already defined in the backend
- Use existing components (ActionBar, StatusTable) for consistency
- Follow the same UI patterns as the user management section

## Testing
- [ ] Test all status transitions
- [ ] Verify status history recording
- [ ] Check suspension functionality
- [x] Test loading states and error handling
- [x] Verify UI consistency with user management

## UI/UX Considerations
- Maintain consistent styling with user management
- Use same color coding for status types
- Ensure clear feedback for status changes
- Maintain responsive design

## Dependencies
- SvelteKit
- TailwindCSS
- SkeletonUI
- Existing administration store
- ActionBar component
- StatusTable component
