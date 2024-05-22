<script lang="ts">
  import type { ActionHash } from '@holochain/client';
  import NavButton from '@lib/NavButton.svelte';
  import ProfileDetailsModal from '@lib/modals/ProfileDetailsModal.svelte';
  import {
    Avatar,
    getModalStore,
    type ConicStop,
    type ModalComponent,
    type ModalSettings,
    ConicGradient
  } from '@skeletonlabs/skeleton';
  import { getAllProfiles, getAllProfilesLinks, profiles } from '@stores/profiles.store';
  import { onMount } from 'svelte';

  let profilesHashes: ActionHash[];

  $: isLoading = true;

  const conicStops: ConicStop[] = [
    { color: 'transparent', start: 0, end: 0 },
    { color: 'rgb(var(--color-primary-500))', start: 75, end: 50 }
  ];

  onMount(async () => {
    await getAllProfiles();
    isLoading = false;
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
    <NavButton href="/profile/create" text="Create profile" />
  </div>
  {#if $profiles && $profiles.length > 0}
    <table class="table">
      <thead>
        <tr>
          <th>Avatar</th>
          <th>Name</th>
          <th>Type</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each $profiles as profile, i}
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
  {#if isLoading && $profiles.length === 0}
    <ConicGradient stops={conicStops} spin>Loading</ConicGradient>
  {/if}
</section>
