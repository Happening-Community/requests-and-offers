<script lang="ts">
  import Navbar from '$lib/NavBar.svelte';
  import { onMount } from 'svelte';
  import '../app.postcss';
  import hc, { isConnected } from '@services/HolochainClientService';
  import { getMyProfile } from '@stores/profiles.store';
  import { ConicGradient, Modal, type ConicStop } from '@skeletonlabs/skeleton';
  import { initializeStores } from '@skeletonlabs/skeleton';

  initializeStores();

  onMount(async () => {
    await hc.connectClient();
    const record = await hc.callZome('ping', 'ping', null);

    await getMyProfile();

    console.log('Ping response:', record);
    console.log('appInfo :', await hc.getAppInfo());
  });

  const conicStops: ConicStop[] = [
    { color: 'transparent', start: 0, end: 0 },
    { color: 'rgb(var(--color-primary-500))', start: 75, end: 50 }
  ];
</script>

<Navbar />

<main
  class="container mx-auto flex min-h-screen flex-col items-center justify-center px-5 pb-10 pt-40"
>
  {#if !$isConnected}
    <p>Not connected yet.</p>
    <ConicGradient stops={conicStops} spin>Loading</ConicGradient>
  {:else}
    <slot />
  {/if}
</main>

<Modal />
