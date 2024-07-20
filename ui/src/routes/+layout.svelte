<script lang="ts">
  import { onMount } from 'svelte';
  import '../app.postcss';
  import hc from '@services/HolochainClientService';
  import { getMyProfile, myProfile } from '@stores/profiles.store';
  import { Modal, Drawer, getDrawerStore } from '@skeletonlabs/skeleton';
  import { initializeStores } from '@skeletonlabs/skeleton';
  import { goto } from '$app/navigation';
  import MenuDrawer from '@lib/drawers/MenuDrawer.svelte';
  import {
    agentIsAdministrator,
    checkIfAgentIsAdministrator,
    registerAdministrator
  } from '@stores/administrators.store';
  import { page } from '$app/stores';
  import AdminMenuDrawer from '@lib/drawers/AdminMenuDrawer.svelte';

  initializeStores();
  const drawerStore = getDrawerStore();

  onMount(async () => {
    await hc.connectClient();
    const record = await hc.callZome('misc', 'ping', null);
    await getMyProfile();

    if ($myProfile) {
      await checkIfAgentIsAdministrator((await hc.getAppInfo())?.agent_pub_key!);
    }

    console.log('Ping response:', record);
    console.log('agentIsAdministrator :', $agentIsAdministrator);
    console.log('clientInfo :', hc.client);
    console.log('appInfo :', await hc.getAppInfo());
  });

  async function handleKeyboardEvent(event: KeyboardEvent) {
    if ($agentIsAdministrator && event.altKey && (event.key === 'a' || event.key === 'A')) {
      event.preventDefault();
      if (!window.location.pathname.startsWith('/admin')) goto('/admin');
      else goto('/');
    }

    if (
      !$agentIsAdministrator &&
      $myProfile &&
      event.ctrlKey &&
      event.shiftKey &&
      (event.key === 'a' || event.key === 'A')
    ) {
      event.preventDefault();
      let confirmation = confirm('Register Admin ?');
      if (confirmation && $myProfile.original_action_hash) {
        await registerAdministrator($myProfile.original_action_hash);
        await checkIfAgentIsAdministrator((await hc.getAppInfo())?.agent_pub_key!);
      }
    }
  }
</script>

<svelte:window on:keydown={handleKeyboardEvent} />

<slot />

<Modal />
<Drawer>
  {#if $drawerStore.id === 'menu-drawer'}
    {#if $page.url.pathname.startsWith('/admin')}
      <AdminMenuDrawer />
    {:else}
      <MenuDrawer />
    {/if}
  {/if}
</Drawer>
