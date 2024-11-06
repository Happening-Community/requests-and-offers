<script lang="ts">
  import { AppShell, ConicGradient, type ConicStop } from '@skeletonlabs/skeleton';
  import NavBar from '@lib/NavBar.svelte';
  import { onMount } from 'svelte';
  import hc from '@services/HolochainClientService.svelte';

  type Props = {
    children: any;
  };

  let { children }: Props = $props();

  onMount(() => {
    const htmlElement = document.getElementsByTagName('html')[0];
    htmlElement.classList.remove('dark');
  });

  const conicStops: ConicStop[] = [
    { color: 'transparent', start: 0, end: 0 },
    { color: 'rgb(var(--color-primary-500))', start: 75, end: 50 }
  ];
</script>

<div class="grid grid-rows-[auto_1fr_auto]">
  <!-- Header -->
  <NavBar />

  <!-- Main Content -->
  <main
    class="container mx-auto flex min-h-screen flex-col items-center justify-center px-5 pb-10 pt-40"
  >
    {#if !hc.isConnected}
      <p>Not connected yet.</p>
      <ConicGradient stops={conicStops} spin>Loading</ConicGradient>
    {:else}
      {@render children()}
    {/if}
  </main>
</div>
