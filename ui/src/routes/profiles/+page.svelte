<script lang="ts">
  import type { ActionHash } from '@holochain/client';
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

<section>
  <h2 class="h2 mb-10">Profiles</h2>
  {#if $profiles && profilesHashes && $profiles.length > 0}
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each $profiles as profile, i}
          <tr>
            <td>{profile.name}</td>
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
