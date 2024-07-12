# Request And Offers

Request And Offers is a hAppenings.community project to facilitate exchanges between Holochain Creators & Advocates! It's a Holochain application.

- [Litepaper](https://happenings-community.gitbook.io/)
- [Specifications](documentation/specifications.md)

## Environment Setup

> PREREQUISITE: set up the [holochain development environment](https://developer.holochain.org/docs/install/).

Enter the nix shell by running this in the root folder of the repository: 

```bash
nix develop
pnpm install
```

**Run all the other instructions in this README from inside this nix develop, otherwise they won't work**.

## Running 2 agents
 
```bash
pnpm start
```

This will create a network of 2 nodes connected to their UI.
It will also bring up the Holochain Playground for advanced introspection of the conductors.

## Running another number of agents

```bash
AGENTS=1 pnpm start
```

It is possible to create a network with a different number of nodes by changing the AGENTS variable.

## Running the tests

```bash
pnpm test
```
This command run all the holochain backend tests and the ui tests.

```bash
pnpm test:ui
```
This one run the sveltekit ui tests.

```bash
pnpm test:misc
```
This one run the miscellaneous tests.

```bash
pnpm test:profiles
```
This one run the profiles zome test.

```bash
pnpm test:administration
```
This one run the administration zome test.

## Packaging

To package the web happ:
``` bash
pnpm run package
```

You'll have the `requests_and_offers.webhapp` in `workdir`. This is what you should distribute so that the Holochain Launcher can install it.
You will also have its subcomponent `requests_and_offers.happ` in the same folder`.

## Documentation

This repository is using these tools:
- [NPM Workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces/): npm v7's built-in monorepo capabilities.
- [hc](https://github.com/holochain/holochain/tree/develop/crates/hc): Holochain CLI to easily manage Holochain development instances.
- [@holochain/tryorama](https://www.npmjs.com/package/@holochain/tryorama): test framework.
- [@holochain/client](https://www.npmjs.com/package/@holochain/client): client library to connect to Holochain from the UI.
- [@holochain-playground/cli](https://www.npmjs.com/package/@holochain-playground/cli): introspection tooling to understand what's going on in the Holochain nodes.

## License

[Cryptographic Autonomy License version 1.0](LICENSE.md)