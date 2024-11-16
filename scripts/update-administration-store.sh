#!/bin/bash

echo "Updating administration store references..."

# Update imports from old administrators store
find ./ui/src -type f \( -name "*.ts" -o -name "*.svelte" \) -exec sed -i 's/@stores\/administrators\.svelte/@stores\/administration.store.svelte/g' {} +

# Update type imports
find ./ui/src -type f \( -name "*.ts" -o -name "*.svelte" \) -exec sed -i 's/from '\''\.\/administrators\.svelte'\''/from '\''@\/types\/holochain'\''/g' {} +

# Update store variable name
find ./ui/src -type f \( -name "*.ts" -o -name "*.svelte" \) -exec sed -i 's/administratorsStore/administrationStore/g' {} +

echo "All references updated successfully!"