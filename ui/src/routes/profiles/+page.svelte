<script lang="ts">
  import type { ActionHash } from '@holochain/client';
  import CreateProfileBtn from '@lib/CreateProfileBtn.svelte';
  import ProfileDetailsModal from '@lib/modals/ProfileDetailsModal.svelte';
  import { getModalStore, type ModalComponent, type ModalSettings } from '@skeletonlabs/skeleton';
  import { getAllProfiles, getAllProfilesLinks, profiles } from '@stores/profiles.store';
  import { onMount } from 'svelte';

  let profilesHashes: ActionHash[];

  onMount(async () => {
    await getAllProfiles();
    profilesHashes = (await getAllProfilesLinks()).map((profile) => profile.target);
    console.log('profilesHashes :', profilesHashes);
  });

  const modalStore = getModalStore();
  const modalComponent: ModalComponent = { ref: ProfileDetailsModal };
  const modal = (id: number, hash: ActionHash): ModalSettings => {
    return {
      type: 'component',
      component: modalComponent,
      meta: {
        id,
        hash
      }
    };
  };
</script>

<section class="flex flex-col gap-4">
  <div class="flex gap-4">
    <h2 class="h2">Profiles</h2>
    <CreateProfileBtn />
  </div>
  {#if $profiles && profilesHashes && $profiles.length > 0}
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each $profiles as profile, i}
          <tr>
            <td>{profile.name}</td>
            <td>{profile.user_type.charAt(0).toUpperCase() + profile.user_type.slice(1)}</td>
            <td>
              <button
                class="btn variant-filled-primary"
                on:click={() => modalStore.trigger(modal(i, profilesHashes[i]))}
              >
                View
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p class="h3 text-error-500">No profiles found.</p>
  {/if}
</section>
