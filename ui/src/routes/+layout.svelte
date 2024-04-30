<script lang="ts">
  import { onMount } from 'svelte';
  import '../app.postcss';
  import hc from '@services/HolochainClientService';
  import { getMyProfile, myProfileIsAdmin } from '@stores/profiles.store';
  import { Modal, Drawer, getDrawerStore } from '@skeletonlabs/skeleton';
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

  /**
   * Toggle between the admin page and the homepage when `Alt + a` is pressed.
   * @param {KeyboardEvent} event - Keyboard event
   */
  function toggleAdminPage(event: KeyboardEvent) {
    if ($myProfileIsAdmin && event.altKey && event.key === 'a') {
      if (!window.location.pathname.startsWith('/admin')) goto('/admin');
      else goto('/');
    }
  }
</script>

<svelte:window on:keydown={toggleAdminPage} />

<!-- <AppShell>
  <svelte:fragment slot="header">
    <Navbar />
  </svelte:fragment>
</AppShell> -->

<slot />

<Modal />
<Drawer>
  {#if $drawerStore.id === 'menu-drawer'}
    <div class="h-10 space-y-5 p-2 md:p-5">
      <div class="flex justify-center">
        <a href="/" on:click={() => drawerStore.close()}>
          <img src="/hAppeningsLogoWsun2.webp" alt="" class="w-28" />
        </a>
      </div>
      <MenuLinks />
    </div>
  {/if}
</Drawer>
