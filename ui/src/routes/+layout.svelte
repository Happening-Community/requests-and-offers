<script lang="ts">
  import Navbar from '$lib/NavBar.svelte';
  import { onMount } from 'svelte';
  import '../app.postcss';
  import hc, { isConnected } from '@services/client.service';

  onMount(async () => {
    await hc.connectClient();
    const record = await hc.callZome('ping', 'ping', null);
    console.log('Ping response:', record);
    console.log('appInfo :', await hc.getAppInfo());
  });
</script>

<Navbar />

<main
  class="container mx-auto flex min-h-screen flex-col items-center justify-center px-5 pb-10 pt-40"
>
  {#if !$isConnected}
    <p>Not connected yet.</p>
  {:else}
    <slot />
  {/if}
</main>
