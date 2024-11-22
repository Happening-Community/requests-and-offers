# UI Development and Refactoring Patterns

## Core Principles

### Component Structure
- Implement proper loading and error states
- Use consistent layout patterns
- Include comprehensive type safety
- Follow responsive design principles
- Separate concerns (data fetching, rendering, interactions)
- Create modular, reusable components

### State Management
- Use Svelte 5 runes (`$state()`, `$derived()`)
- Implement consistent loading states
- Add proper error handling and messaging
- Use derived stores for computed values
- Minimize unnecessary re-renders
- Use efficient reactive statements

### Error Handling Strategy
1. Implement user-friendly error messages
2. Create centralized error display mechanism
3. Add retry mechanisms where appropriate
4. Log errors for debugging without exposing sensitive info
5. Handle network and data fetching issues gracefully

### Data Fetching
- Use `Promise.allSettled()` for resilient operations
- Implement retry mechanisms
- Add proper error handling
- Include loading states
- Optimize data fetching strategies
- Handle timeout scenarios

## Implementation Guidelines

### Component Design
#### Modal Components
- Implement proper cleanup on unmount
- Include loading states for async operations
- Add comprehensive error handling
- Use form validation where applicable

#### Table Components
- Include error handling and loading states
- Implement comprehensive type safety
- Add ARIA labels for accessibility
- Optimize reactive state management

### Type Safety and Quality
- Run `bunx sv check` frequently
- Fix type errors immediately
- Use proper TypeScript types throughout
- Remove unnecessary comments
- Create reusable components
- Maintain consistent styling

## Tools and Technologies
- Skeleton UI for consistent design
- Holochain client for data management
- Svelte 5 runes for reactive state management
- SvelteKit for routing

## Testing and Validation
- Run `bunx sv check` from ui/ directory
- Address warnings and errors immediately
- Test component interactions
- Validate form inputs
- Develop comprehensive testing strategy
- Performance profiling of components

## Documentation
- Update documentation after significant changes
- Include implementation notes
- Document known issues
- Maintain clear task tracking
- Create documentation for new component structures

## Recent Examples and Lessons
### Refactored Components
- Organizations Create Page
- Organizations Table
- User Profile Page

### Key Learnings
1. Centralize creation logic
2. Use consistent error handling patterns
3. Implement loading states universally
4. Create reusable table and form components
