<script lang="ts">
  import {
    Avatar,
    getModalStore,
    type ModalComponent,
    type ModalSettings
  } from '@skeletonlabs/skeleton';
  import UserDetailsModal from '@lib/modals/UserDetailsModal.svelte';
  import { onMount } from 'svelte';
  import { getAllAdministrators, administrators } from '@stores/administrators.store';
  import AddAdministratorModal from '@lib/modals/AddAdministratorModal.svelte';
  import type { User } from '@stores/users.store';

  let isLoading = $state(true);

  const modalStore = getModalStore();
  const userDetailsModalComponent: ModalComponent = { ref: UserDetailsModal };
  const userDetailsModal = (user: User): ModalSettings => {
    return {
      type: 'component',
      component: userDetailsModalComponent,
      meta: {
        user
      }
    };
  };
  const addAdministratorModalComponent: ModalComponent = { ref: AddAdministratorModal };
  const addAdministratorModal: ModalSettings = {
    type: 'component',
    component: addAdministratorModalComponent
  };

  onMount(async () => {
    await getAllAdministrators();

    isLoading = false;
  });
</script>

<section class="flex flex-col gap-10">
  <h1 class="h1 text-center">Administrators management</h1>

  <div class="flex flex-col gap-4 lg:pr-4">
    <div class="flex flex-col items-center justify-center sm:flex-row sm:justify-around">
      <h2 class="h3">Network administrators</h2>
      <button
        class="btn variant-filled-secondary w-fit"
        onclick={() => modalStore.trigger(addAdministratorModal)}>Add administrator</button
      >
    </div>

    {#if $administrators && $administrators.length > 0}
      <table class="table-hover table drop-shadow-lg">
        <thead>
          <tr>
            <th>Avatar</th>
            <th>Name</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each $administrators as user, i}
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
                  onclick={() => modalStore.trigger(userDetailsModal(user))}
                >
                  View
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</section>
