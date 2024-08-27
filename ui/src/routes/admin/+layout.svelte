<script lang="ts">
  import { goto } from '$app/navigation';
  import AdminSideBar from '@lib/AdminSideBar.svelte';
  import NavBar from '@lib/NavBar.svelte';
  import hc from '@services/HolochainClientService.svelte';
  import { ConicGradient, type ConicStop } from '@skeletonlabs/skeleton';
  import administratorsStore from '@stores/administrators.svelte';
  import { onMount } from 'svelte';

  type Props = {
    children: any;
  };

  const { children }: Props = $props();

  const { agentIsAdministrator } = $derived(administratorsStore);

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

<div class="grid h-screen grid-rows-[auto_1fr_auto]">
  <!-- Header -->
  <NavBar />

  <!-- Grid Columns -->
  <div class="grid grid-cols-1 md:grid-cols-[auto_1fr]">
    <!-- Left Sidebar. -->
    <div class="hidden sm:block">
      <AdminSideBar />
    </div>

    <!-- Main Content -->
    <main
      class="bg-surface-800 mx-auto flex h-screen w-full flex-col items-center justify-center px-5 pb-10 pt-40"
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
