<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import '../app.postcss';
  import hc from '@services/HolochainClientService.svelte';
  import usersStore from '@stores/users.svelte';
  import { Modal, Drawer, getDrawerStore } from '@skeletonlabs/skeleton';
  import { initializeStores } from '@skeletonlabs/skeleton';
  import { goto } from '$app/navigation';
  import MenuDrawer from '@lib/drawers/MenuDrawer.svelte';
  import administrationStore from '@stores/administration.store';
  import { page } from '$app/stores';
  import AdminMenuDrawer from '@lib/drawers/AdminMenuDrawer.svelte';
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
  import { storePopup } from '@skeletonlabs/skeleton';

  type Props = {
    children: Snippet;
  };

  const { children } = $props() as Props;

  const { myProfile } = $derived(usersStore);
  const { agentIsAdministrator } = $derived(administrationStore);

  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

  initializeStores();
  const drawerStore = getDrawerStore();

  onMount(async () => {
    await hc.connectClient();
    const record = await hc.callZome('misc', 'ping', null);
    await usersStore.getMyProfile();

    if (myProfile) {
      await administrationStore.checkIfAgentIsAdministrator(
        (await hc.getAppInfo())?.agent_pub_key!
      );
    }

    console.log('Ping response:', record);
    console.log('agentIsAdministrator :', agentIsAdministrator);
    console.log('clientInfo :', hc.client);
    console.log('appInfo :', await hc.getAppInfo());
  });

  async function handleKeyboardEvent(event: KeyboardEvent) {
    if (agentIsAdministrator && event.altKey && (event.key === 'a' || event.key === 'A')) {
      event.preventDefault();
      if (!window.location.pathname.startsWith('/admin')) goto('/admin');
      else goto('/');
    }

    if (
      myProfile &&
      !agentIsAdministrator &&
      event.ctrlKey &&
      event.shiftKey &&
      (event.key === 'a' || event.key === 'A')
    ) {
      event.preventDefault();
      let confirmation = confirm('Register Admin ?');
      if (confirmation && myProfile.original_action_hash) {
        const agentPubkey = (await hc.getAppInfo())?.agent_pub_key!;
        await administrationStore.registerNetworkAdministrator(myProfile.original_action_hash, [
          agentPubkey
        ]);
        await administrationStore.checkIfAgentIsAdministrator(agentPubkey);
      }
    }
  }
</script>

<svelte:window onkeydown={handleKeyboardEvent} />

{@render children()}

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
