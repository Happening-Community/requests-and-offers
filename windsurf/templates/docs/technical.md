# Documentation Template

## Overview
Brief description of what this document covers.

## Technical Details

### DNA Structure
```rust
// Entry type example
pub struct Example {
    pub field1: String,
    pub field2: Vec<ActionHash>,
}
```

### Functions
```rust
// Function example
#[hdk_extern]
pub fn example_function(input: ExampleInput) -> ExternResult<ExampleOutput> {
    // Implementation
}
```

### Integration
```typescript
// Service example
export class ExampleService {
    async exampleFunction(input: ExampleInput): Promise<ExampleOutput> {
        // Implementation
    }
}
```

## Usage Examples

### Basic Usage
```typescript
// Usage example
const result = await exampleFunction(input);
```

### Common Patterns
```typescript
// Pattern example
const pattern = async () => {
    // Implementation
};
```

## Testing

### Unit Tests
```rust
// Test example
#[test]
fn test_example() {
    // Test implementation
}
```

### Integration Tests
```typescript
// Tryorama test example
test('example test', async () => {
    // Test implementation
});
```

## Notes
- Important note 1
- Important note 2

## Related
- Link 1
- Link 2
