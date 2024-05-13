<script lang="ts">
  import { onMount } from 'svelte';
  import '../app.postcss';
  import hc from '@services/HolochainClientService';
  import { getMyProfile, myProfileIsAdmin } from '@stores/profiles.store';
  import { Modal, Drawer, getDrawerStore } from '@skeletonlabs/skeleton';
  import { initializeStores } from '@skeletonlabs/skeleton';
  import { goto } from '$app/navigation';
  import MenuDrawer from '@lib/drawers/MenuDrawer.svelte';

  initializeStores();
  const drawerStore = getDrawerStore();

  onMount(async () => {
    await hc.connectClient();
    const record = await hc.callZome('ping', 'ping', null);

    await getMyProfile();

    console.log('Ping response:', record);
    console.log('appInfo :', await hc.getAppInfo());
  });

  /**
   * Toggle between the admin page and the homepage when `Alt + a` is pressed.
   * @param {KeyboardEvent} event - Keyboard event
   */
  function toggleAdminPage(event: KeyboardEvent) {
    if ($myProfileIsAdmin && event.altKey && (event.key === 'a' || event.key === 'A')) {
      event.preventDefault();
      if (!window.location.pathname.startsWith('/admin')) goto('/admin');
      else goto('/');
    }
  }
</script>

<svelte:window on:keydown={toggleAdminPage} />

<slot />

<Modal />
<Drawer>
  {#if $drawerStore.id === 'menu-drawer'}
    <MenuDrawer />
  {/if}
</Drawer>
