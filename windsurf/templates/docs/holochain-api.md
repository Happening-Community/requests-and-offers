# Holochain API Documentation Template

## Overview
Brief description of the zome/feature.

## Entry Types

### EntryTypeName
```rust
#[hdk_entry_helper]
pub struct EntryTypeName {
    pub field1: String,
    pub field2: Vec<ActionHash>,
}
```

**Fields:**
- `field1`: Description
- `field2`: Description

**Validation:**
```rust
pub fn validate_entry_type_name(entry: EntryTypeName) -> ExternResult<ValidateCallbackResult> {
    // Validation rules
}
```

## Link Types

### LinkTypeName
- **Base:** Type of base entry
- **Target:** Type of target entry
- **Tag:** Description of tag usage
- **Validation:** Link validation rules

## Zome Functions

### function_name

```rust
#[hdk_extern]
pub fn function_name(input: InputType) -> ExternResult<OutputType> {
    // Implementation
}
```

**Input:**
```rust
pub struct InputType {
    pub field1: String,
    pub field2: ActionHash,
}
```

**Output:**
```rust
pub struct OutputType {
    pub result: String,
    pub hash: ActionHash,
}
```

**Errors:**
- `Error1`: When and why it occurs
- `Error2`: When and why it occurs

**Example:**
```typescript
// Service Layer
export class ExampleService {
    async functionName(input: InputType): Promise<OutputType> {
        return await this.client.callZome({
            zome_name: "zome_name",
            fn_name: "function_name",
            payload: input,
        });
    }
}

// Usage
const result = await service.functionName({
    field1: "example",
    field2: actionHash,
});
```

## Common Patterns

### Pattern Name
Description of when and how to use this pattern.

```typescript
// Pattern implementation
const pattern = async () => {
    // Implementation
};
```

## Testing

### Unit Tests
```rust
#[test]
fn test_function_name() {
    // Test implementation
}
```

### Integration Tests
```typescript
test("should perform function_name correctly", async () => {
    const client = await player1.client();
    const result = await functionName(client, input);
    t.ok(result);
});
```

## Related
- Link to related functions
- Link to related entry types
- Link to UI components
