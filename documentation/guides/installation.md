# Installation Guide

This guide provides detailed instructions for installing and setting up the Requests & Offers application.

## System Requirements

- Linux, macOS, or Windows with WSL2
- Holochain Development Environment
- Node.js 16 or later
- pnpm 9.7.0 or later

## Installation Steps

### 1. Development Environment Setup

#### Install Holochain
Follow the [official Holochain installation guide](https://developer.holochain.org/get-started/#2-installing-holochain-development-environment) for your operating system.

You can quickly install Holochain using this command:
```bash
bash <(curl https://holochain.github.io/holochain/setup.sh)
```

This will set up the complete Holochain development environment, including Nix and all necessary components.

### 2. Project Setup

#### Clone the Repository
```bash
git clone https://github.com/Happening-Community/requests-and-offers.git
cd requests-and-offers
```

#### Enter Nix Shell
```bash
nix develop
```

#### Install Dependencies
```bash
pnpm install
```
This will also download the hREA suite as part of the postinstall script.

### 3. Development Setup

The application consists of two main parts:
1. Frontend (SvelteKit application)
2. Backend (Holochain DNA with multiple zomes)

#### Start Development Environment

```bash
# Start with default configuration (2 agents)
pnpm start

# Start with custom number of agents
AGENTS=3 pnpm start

# Start with Tauri (desktop application)
pnpm start:tauri
```

This will:
1. Clean the Holochain sandbox
2. Build the hApp
3. Start the UI server
4. Launch the Holochain environment
5. Start the Holochain Playground

### 4. Testing

#### Run All Tests
```bash
pnpm test
```
This runs:
- Zome builds
- Backend tests
- Frontend tests
- Status module tests

#### Component Tests
```bash
# Frontend tests only
pnpm test:ui

# Individual zome tests
pnpm test:misc           # Misc zome functionality
pnpm test:users          # Users Organizations zome
pnpm test:administration # Administration zome
pnpm test:organizations  # Organizations functionality
pnpm test:status        # Status module
```

### 5. Building

#### Development Builds
```bash
# Build Holochain zomes
pnpm build:zomes

# Build complete hApp (includes zome builds)
pnpm build:happ
```

#### Production Package
```bash
# Create production package (includes hApp and UI)
pnpm package
```

### 6. hREA Integration

The project integrates with hREA (Holochain Resource-Event-Agent). The hREA suite is automatically downloaded during installation, but you can manage it with:

```bash
# Re-download hREA suite
pnpm run download-hrea-suite

# Remove hREA suite
pnpm run clean:hrea-suite
```

## Development Resources

- [Technical Documentation](../technical/README.md)
- [API Documentation](../technical/zomes/)
- [Contributing Guide](./contributing.md)
- [Feature Specifications](../specifications/features.md)

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   The application automatically finds available ports for:
   - UI server
   - Bootstrap server
   - Signal server

2. **Build Issues**
   ```bash
   # Clean and rebuild
   pnpm run build:zomes
   pnpm run build:happ
   ```

3. **hREA Integration Issues**
   ```bash
   # Reinstall hREA suite
   pnpm run clean:hrea-suite
   pnpm run download-hrea-suite
   ```

### Getting Help

- Join our [Community](https://happenings.community/)
- Check [GitHub Issues](https://github.com/Happening-Community/requests-and-offers/issues)
- Connect on [Discord](https://discord.gg/happening)
