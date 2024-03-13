<script lang="ts">
  import type { ActionHash } from '@holochain/client';
  import ProfileDetailsModal from '@lib/modals/ProfileDetailsModal.svelte';
  import { getModalStore, type ModalComponent, type ModalSettings } from '@skeletonlabs/skeleton';
  import { getAllProfiles, getAllProfilesLinks, profiles } from '@stores/profiles.store';
  import { onMount } from 'svelte';

  let profilesHashes: ActionHash[];

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

  onMount(async () => {
    await getAllProfiles();
    profilesHashes = (await getAllProfilesLinks()).map((profile) => profile.target);
    console.log('profilesHashes :', profilesHashes);
  });
</script>

<section>
  <h2 class="h2 mb-10">Profiles</h2>
  {#if $profiles.length === 0}
    <p class="h3 text-error-500">No profiles found.</p>
  {:else if $profiles && profilesHashes}
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
              <!-- <a href="/profile?id={i}&hash={profilesHashes[i]}" class="btn variant-filled-primary">
                View
              </a> -->
              <button
                class="btn variant-filled-primary"
                on:click={() => modalStore.trigger(modal(i, profilesHashes[i]))}>View</button
              >
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p>No profiles found.</p>
  {/if}
</section>
