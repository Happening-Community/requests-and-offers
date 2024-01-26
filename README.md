# Request And Offers

Request And Offers is a hAppenings.community project to facilitate exchanges between Holochain Creators & Advocates! It's a Holochain application.

- [Litepaper](https://happenings-community.gitbook.io/)
- [Specs](./specs.md)

## Environment Setup

> PREREQUISITE: set up the [holochain development environment](https://developer.holochain.org/docs/install/).

Enter the nix shell by running this in the root folder of the repository: 

```bash
nix develop
pnpm install
```

**Run all the other instructions in this README from inside this nix develop, otherwise they won't work**.

## Running 1 agent
 
```bash
pnpm start
```

This will create a network of 2 nodes connected to each other and their respective UIs.
It will also bring up the Holochain Playground for advanced introspection of the conductors.

## Running the tests

```bash
pnpm test:zomes
```
This command run the holochain backend tests.

```bash
pnpm test:ui
```
This one run the sveltekit ui tests.

```bash
pnpm test
```
And finally, this command run the backend tests then the ui tests.

## Bootstrapping a network

Create a custom network of nodes connected to each other and their respective UIs with:

```bash
AGENTS=3 pnpm run network
```

Substitute the "3" for the number of nodes that you want to bootstrap in your network.
This will also bring up the Holochain Playground for advanced introspection of the conductors.

## Packaging

To package the web happ:
``` bash
pnpm run package
```

You'll have the `requests-and-offers.webhapp` in `workdir`. This is what you should distribute so that the Holochain Launcher can install it.
You will also have its subcomponent `requests-and-offers.happ` in the same folder`.

## Documentation

This repository is using these tools:
- [NPM Workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces/): npm v7's built-in monorepo capabilities.
- [hc](https://github.com/holochain/holochain/tree/develop/crates/hc): Holochain CLI to easily manage Holochain development instances.
- [@holochain/tryorama](https://www.npmjs.com/package/@holochain/tryorama): test framework.
- [@holochain/client](https://www.npmjs.com/package/@holochain/client): client library to connect to Holochain from the UI.
- [@holochain-playground/cli](https://www.npmjs.com/package/@holochain-playground/cli): introspection tooling to understand what's going on in the Holochain nodes.

## License

Copyright (C) 2024, hAppening Community

This program is free software: you can redistribute it and/or modify it under the terms of the license provided in the LICENSE file (CAL-1.0). This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
