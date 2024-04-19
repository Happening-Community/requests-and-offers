<script lang="ts">
  import { isConnected } from '@services/HolochainClientService';
  import { AppShell, ConicGradient, type ConicStop } from '@skeletonlabs/skeleton';
  import Navbar from '@lib/NavBar.svelte';
  import { onMount } from 'svelte';

  onMount(() => {
    const htmlElement = document.getElementsByTagName('html')[0];
    htmlElement.classList.remove('dark');
  });

  const conicStops: ConicStop[] = [
    { color: 'transparent', start: 0, end: 0 },
    { color: 'rgb(var(--color-primary-500))', start: 75, end: 50 }
  ];
</script>

<AppShell>
  <svelte:fragment slot="header">
    <Navbar />
  </svelte:fragment>

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
</AppShell>
