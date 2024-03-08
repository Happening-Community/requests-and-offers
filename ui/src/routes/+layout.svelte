<script lang="ts">
  import Navbar from '$lib/NavBar.svelte';
  import { onMount, setContext } from 'svelte';
  import '../app.postcss';
  import { AppAgentWebsocket, type AppAgentClient } from '@holochain/client';

  let client: AppAgentClient | undefined;

  let loading = true;

  export const clientContext = 'client';

  onMount(async () => {
    // We pass an unused string as the url because it will dynamically be replaced in launcher environments
    client = await AppAgentWebsocket.connect(new URL('https://UNUSED'), 'requests-and-offers');

    loading = false;

    console.log('client :', client);
    const record = await client.callZome({
      cap_secret: null,
      zome_name: 'ping',
      role_name: 'requests_and_offers',
      fn_name: 'ping',
      payload: null
    });

    console.log('record :', record);
  });

  setContext(clientContext, {
    getClient: () => client
  });
</script>

<Navbar />

<main
  class="container mx-auto flex min-h-screen flex-col items-center justify-center px-5 pb-10 pt-40"
>
  <slot />
</main>
