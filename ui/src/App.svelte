<script lang="ts">
  import { onMount, setContext } from "svelte";
  import type { ActionHash, AppAgentClient } from "@holochain/client";
  import { AppAgentWebsocket } from "@holochain/client";

  import { clientContext } from "./contexts";
  import CreateIndividualProfile from "./profiles/CreateIndividualProfile.svelte";
  // import { getMyProfile } from "./profiles/stores/profile.store";

  let client: AppAgentClient | undefined;

  let loading = true;

  onMount(async () => {
    // We pass '' as url because it will dynamically be replaced in launcher environments
    client = await AppAgentWebsocket.connect(
      "" as unknown as URL,
      "requests-and-offers"
    );

    loading = false;
    // getMyProfile();
  });

  setContext(clientContext, {
    getClient: () => client,
  });
</script>

<main>
  {#if loading}
    <div
      style="display: flex; flex: 1; align-items: center; justify-content: center"
    ></div>
  {:else}
    <h1>Hello World !</h1>

    <!-- {#if $myProfile}
      You have a profile
    {:else}
      <CreateIndividualProfile />
    {/if} -->
  {/if}
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
