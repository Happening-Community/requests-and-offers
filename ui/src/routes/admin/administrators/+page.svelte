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
  import { getAllAdministrators, administrators } from '@stores/administrators.store';
  import AddAdministratorModal from '@lib/modals/AddAdministratorModal.svelte';
  import type { Profile } from '@stores/profiles.store';

  $: isLoading = true;

  const modalStore = getModalStore();
  const profileDetailsModalComponent: ModalComponent = { ref: ProfileDetailsModal };
  const profileDetailsModal = (profile: Profile): ModalSettings => {
    return {
      type: 'component',
      component: profileDetailsModalComponent,
      meta: {
        profile
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
  <h1 class="h1">Administrators management</h1>

  <div class="flex flex-col gap-4 lg:pr-4">
    <div class="flex justify-around">
      <h2 class="h3">Network administrators</h2>
      <button
        class="btn variant-filled-secondary w-fit"
        on:click={() => modalStore.trigger(addAdministratorModal)}>Add administrator</button
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
                  on:click={() => modalStore.trigger(profileDetailsModal(profile))}
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
