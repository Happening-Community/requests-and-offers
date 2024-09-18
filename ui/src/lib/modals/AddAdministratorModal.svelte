<script lang="ts">
  import ConfirmModal from '@lib/dialogs/ConfirmModal.svelte';
  import type { ConfirmModalMeta } from '@lib/types';
  import {
    Avatar,
    ConicGradient,
    getModalStore,
    type ConicStop,
    type ModalComponent,
    type ModalSettings
  } from '@skeletonlabs/skeleton';
  import administratorsStore from '@stores/administrators.svelte';
  import usersStore, { type User } from '@stores/users.svelte';
  import { queueAndReverseModal } from '@utils';
  import { onMount } from 'svelte';

  const { administrators, nonAdministrators } = $derived(administratorsStore);

  let filteredUsers: User[] = $state([]);
  let searchInput = $state('');
  let isLoading = $state(true);

  const conicStops: ConicStop[] = [
    { color: 'transparent', start: 0, end: 0 },
    { color: 'rgb(var(--color-secondary-500))', start: 75, end: 50 }
  ];

  onMount(async () => {
    await administratorsStore.getNonAdministratorUsers();
    filteredUsers = nonAdministrators;

    isLoading = false;
  });

  const modalStore = getModalStore();

  const addAdministratorConfirmationModalMeta: ConfirmModalMeta = {
    id: 'confirm-add-administrator',
    message: 'Do you really want to make this user an administrator ?',
    confirmLabel: 'Yes',
    cancelLabel: 'No'
  };

  const confirmModalComponent: ModalComponent = { ref: ConfirmModal };
  const confirmModal = (meta: ConfirmModalMeta, user: User): ModalSettings => {
    return {
      type: 'component',
      component: confirmModalComponent,
      meta,
      async response(r: boolean) {
        if (r) {
          try {
            const userAgents = await usersStore.getUserAgents(user.original_action_hash!);
            console.log('userAgents', userAgents);

            if (!userAgents.length) {
              modalStore.close();
              return;
            }
            await administratorsStore.registerNetworkAdministrator(
              user.original_action_hash!,
              userAgents
            );
            administratorsStore.administrators = [...administrators, user];
          } catch (error) {}
          modalStore.close();
        }
      }
    };
  };

  async function addAdministrator(user: User) {
    queueAndReverseModal(confirmModal(addAdministratorConfirmationModalMeta, user), modalStore);
  }

  function searchInputHandler(evt: Event) {
    searchInput = (evt.target as HTMLInputElement).value;
    filteredUsers = nonAdministrators.filter((user) =>
      user.name.toLowerCase().includes(searchInput.toLowerCase())
    );

    if (filteredUsers.length === 0 && searchInput === '') {
      filteredUsers = nonAdministrators;
    }
  }
</script>

<article class="hcron-modal">
  <div class="static mb-8 space-y-4">
    <h2 class="h2 text-center">Add an administrator</h2>

    {#if nonAdministrators.length > 0}
      <div>
        <input
          class="input"
          type="text"
          placeholder="Search by name"
          bind:value={searchInput}
          oninput={searchInputHandler}
        />
      </div>

      {#if isLoading}
        <div class="flex justify-center">
          <ConicGradient stops={conicStops} spin>Loading</ConicGradient>
        </div>
      {:else}
        <table class="table-hover table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Name</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredUsers as user, i}
              <tr>
                <td>
                  <Avatar
                    src={user.picture
                      ? URL.createObjectURL(new Blob([new Uint8Array(user.picture)]))
                      : '/default_avatar.webp'}
                  />
                </td>
                <td>{user.name}</td>
                <td>
                  {user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1)}
                </td>
                <td>
                  <button
                    class="btn variant-filled-secondary"
                    onclick={() => addAdministrator(user)}
                  >
                    Make admin
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    {:else}
      <p class="pt-4 text-center">No non administrator users found.</p>
    {/if}
  </div>
</article>
