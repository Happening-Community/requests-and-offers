<script lang="ts">
  import { goto } from '$app/navigation';
  import AdminSideBar from '$lib/AdminSideBar.svelte';
  import NavBar from '$lib/NavBar.svelte';
  import hc from '@services/HolochainClientService.svelte';
  import { ConicGradient, type ConicStop } from '@skeletonlabs/skeleton';
  import administrationStore from '@stores/administration.store.svelte';
  import { onMount } from 'svelte';

  const { children } = $props();

  const { agentIsAdministrator } = $derived(administrationStore);

  const conicStops: ConicStop[] = [
    { color: 'transparent', start: 0, end: 0 },
    { color: 'rgb(var(--color-secondary-500))', start: 75, end: 50 }
  ];

  onMount(async () => {
    const htmlElement = document.getElementsByTagName('html')[0];
    htmlElement.classList.add('dark');

    if (!agentIsAdministrator) goto('/');
  });
</script>

<div class="flex h-screen flex-col overflow-hidden">
  <!-- Header -->
  <NavBar />

  <!-- Content Container -->
  <div class="flex flex-1 overflow-hidden">
    <!-- Sidebar -->
    <div class="hidden sm:block">
      <AdminSideBar />
    </div>

    <!-- Main Content -->
    <main
      class="bg-surface-800 flex min-h-full w-full flex-1 flex-col items-center overflow-auto px-5 py-10"
    >
      {#if !hc.isConnected}
        <p>Not connected yet.</p>
        <ConicGradient stops={conicStops} spin>Loading</ConicGradient>
      {:else}
        {@render children()}
      {/if}
    </main>
  </div>
</div>
