<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import usersStore from '@/stores/users.store.svelte';
  import hc from '@services/HolochainClientService.svelte';
  import administrationStore from '@stores/administration.store.svelte';
  import { page } from '$app/stores';
  import AdminMenuDrawer from '@lib/drawers/AdminMenuDrawer.svelte';
  import MenuDrawer from '@lib/drawers/MenuDrawer.svelte';
  import { Modal, Drawer, getDrawerStore } from '@skeletonlabs/skeleton';
  import { initializeStores } from '@skeletonlabs/skeleton';
  import { goto } from '$app/navigation';
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
  import { storePopup } from '@skeletonlabs/skeleton';

  type Props = {
    children: Snippet;
  };

  const { children } = $props() as Props;

  const { currentUser } = $derived(usersStore);
  const { agentIsAdministrator } = $derived(administrationStore);

  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

  initializeStores();
  const drawerStore = getDrawerStore();

  onMount(async () => {
    await hc.connectClient();
    await usersStore.refresh();
    const record = await hc.callZome('misc', 'ping', null);

    if (currentUser) {
      const agentPubKey = (await hc.getAppInfo())?.agent_pub_key;
      if (agentPubKey) {
        await administrationStore.getAllNetworkAdministrators();
        administrationStore.agentIsAdministrator = administrationStore.administrators.some(
          (admin) => admin.original_action_hash === agentPubKey
        );
      }
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
      currentUser &&
      !agentIsAdministrator &&
      event.ctrlKey &&
      event.shiftKey &&
      (event.key === 'a' || event.key === 'A')
    ) {
      event.preventDefault();
      let confirmation = confirm('Register Admin ?');
      if (confirmation && currentUser.original_action_hash) {
        const agentPubKey = (await hc.getAppInfo())?.agent_pub_key;
        if (agentPubKey) {
          await administrationStore.registerNetworkAdministrator(currentUser.original_action_hash, [
            agentPubKey
          ]);
          await administrationStore.getAllNetworkAdministrators();
          administrationStore.agentIsAdministrator = administrationStore.administrators.some(
            (admin) => admin.original_action_hash === agentPubKey
          );
        }
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
