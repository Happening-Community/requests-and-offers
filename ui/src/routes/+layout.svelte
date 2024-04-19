<script lang="ts">
  import Navbar from '$lib/NavBar.svelte';
  import { onMount } from 'svelte';
  import '../app.postcss';
  import hc, { isConnected } from '@services/HolochainClientService';
  import { getMyProfile, myProfileIsAdmin } from '@stores/profiles.store';
  import {
    ConicGradient,
    Modal,
    type ConicStop,
    Drawer,
    getDrawerStore,
    AppShell
  } from '@skeletonlabs/skeleton';
  import { initializeStores } from '@skeletonlabs/skeleton';
  import MenuLinks from '@lib/MenuLinks.svelte';
  import { goto } from '$app/navigation';

  initializeStores();
  const drawerStore = getDrawerStore();

  onMount(async () => {
    await hc.connectClient();
    const record = await hc.callZome('ping', 'ping', null);

    await getMyProfile();

    console.log('Ping response:', record);
    console.log('appInfo :', await hc.getAppInfo());
  });

  function goToAdminShortcut(event: KeyboardEvent) {
    if ($myProfileIsAdmin && event.altKey && event.key === 'a') {
      goto('/admin');
    }
  }
</script>

<svelte:window on:keydown={goToAdminShortcut} />

<slot />

<Modal />
<Drawer>
  {#if $drawerStore.id === 'menu-drawer'}
    <div class="flex h-10 flex-col gap-5 p-2 md:p-5">
      <MenuLinks />
    </div>
  {/if}
</Drawer>
