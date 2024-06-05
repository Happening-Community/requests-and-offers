<script lang="ts">
  import {
    Avatar,
    getModalStore,
    type ModalComponent,
    type ModalSettings
  } from '@skeletonlabs/skeleton';
  import type { ActionHash } from '@holochain/client';
  import ProfileDetailsModal from '@lib/modals/ProfileDetailsModal.svelte';
  import { onMount } from 'svelte';
  import {
    getAllAdministrators,
    getAllAdministratorsLinks,
    administrators,
    administratorProfilesHashes
  } from '@stores/administrators.store';
  import AddAdministratorModal from '@lib/modals/AddAdministratorModal.svelte';

  $: isLoading = true;

  const modalStore = getModalStore();
  const profileDetailsModalComponent: ModalComponent = { ref: ProfileDetailsModal };
  const profileDetailsModal = (id: number, hash: ActionHash): ModalSettings => {
    return {
      type: 'component',
      component: profileDetailsModalComponent,
      meta: {
        id,
        hash
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
    $administratorProfilesHashes = (await getAllAdministratorsLinks()).map(
      (profile) => profile.target
    );
    console.log('administratorProfilesHashes :', administratorProfilesHashes);
  });
</script>

<section class="flex flex-col gap-10">
  <h1 class="h1">Administrators management</h1>

  <div class="flex justify-center">
    <button
      class="btn variant-filled-secondary w-fit"
      on:click={() => modalStore.trigger(addAdministratorModal)}>Add administrator</button
    >
  </div>

  <div class="flex flex-col gap-4 lg:pr-4">
    <h2 class="h3">Network administrators</h2>
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
          {#each $administrators as profile, i}
            <tr>
              <td>
                <Avatar
                  src={profile.picture
                    ? URL.createObjectURL(new Blob([new Uint8Array(profile.picture)]))
                    : '/default_avatar.webp'}
                />
              </td>
              <td>{profile.name}</td>
              <td>
                {profile.user_type.charAt(0).toUpperCase() + profile.user_type.slice(1)}
              </td>
              <td>
                <button
                  class="btn variant-filled-secondary"
                  on:click={() =>
                    modalStore.trigger(profileDetailsModal(i, $administratorProfilesHashes[i]))}
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
