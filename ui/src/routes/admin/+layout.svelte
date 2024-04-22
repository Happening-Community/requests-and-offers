<script lang="ts">
  import Navbar from '@lib/NavBar.svelte';
  import { isConnected } from '@services/HolochainClientService';
  import { AppShell, ConicGradient, type ConicStop } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte';

  const conicStops: ConicStop[] = [
    { color: 'transparent', start: 0, end: 0 },
    { color: 'rgb(var(--color-primary-500))', start: 75, end: 50 }
  ];

  onMount(() => {
    const htmlElement = document.getElementsByTagName('html')[0];
    htmlElement.classList.add('dark');
  });
</script>

<AppShell>
  <svelte:fragment slot="header">
    <Navbar />
  </svelte:fragment>

  <svelte:fragment slot="sidebarLeft">
    <div
      class="bg-surface-900 mt-32 flex min-h-screen w-52 flex-col gap-3 border-2 border-slate-900 p-4"
    >
      <a
        href="/admin"
        class="h3 hover:text-secondary-500 hover:border-b-secondary-500 mb-4 border-b-2 border-b-white text-center text-white"
      >
        Admin Panel
      </a>
      <a class="btn variant-filled-primary" href="/admin/administrators">Administrators</a>
      <a class="btn variant-filled-primary" href="/admin/profiles">Profiles</a>
    </div>
  </svelte:fragment>

  <main
    class="bg-surface-800 mx-auto flex min-h-screen flex-col items-center justify-center px-5 pb-10 pt-40"
  >
    {#if !$isConnected}
      <p>Not connected yet.</p>
      <ConicGradient stops={conicStops} spin>Loading</ConicGradient>
    {:else}
      <slot />
    {/if}
  </main>
</AppShell>
