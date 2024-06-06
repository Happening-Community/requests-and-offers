<script lang="ts">
  import type { ActionHash } from '@holochain/client';
  import { Avatar, ConicGradient, getModalStore, type ConicStop } from '@skeletonlabs/skeleton';
  import {
    administrators,
    getNonAdministratorProfiles,
    getNonAdministratorProfilesLinks,
    registerAdministrator
  } from '@stores/administrators.store';
  import { type Profile } from '@stores/profiles.store';
  import { onMount } from 'svelte';

  export let parent: any;

  let nonAdminProfiles: Profile[] = [];
  let nonAdminProfilesHashes: ActionHash[] = [];
  let filteredProfiles: Profile[] = [];
  let searchInput = '';
  let isLoading = true;

  const conicStops: ConicStop[] = [
    { color: 'transparent', start: 0, end: 0 },
    { color: 'rgb(var(--color-secondary-500))', start: 75, end: 50 }
  ];

  onMount(async () => {
    nonAdminProfiles = await getNonAdministratorProfiles();
    nonAdminProfilesHashes = (await getNonAdministratorProfilesLinks()).map((l) => l.target);
    filteredProfiles = nonAdminProfiles;
    isLoading = false;
  });

  const modalStore = getModalStore();

  async function addAdministrator(profile: Profile) {
    const confirmation = confirm('Do you really want to make this profile an administrator ?');
    if (confirmation) {
      registerAdministrator(profile.original_action_hash);
      administrators.set([...$administrators, profile]);
      modalStore.close();
    }
  }

  function searchInputHandler(evt: Event) {
    searchInput = (evt.target as HTMLInputElement).value;
    filteredProfiles = nonAdminProfiles.filter((profile) =>
      profile.name.toLowerCase().includes(searchInput.toLowerCase())
    );

    if (filteredProfiles.length === 0 && searchInput === '') {
      filteredProfiles = nonAdminProfiles;
    }
  }
</script>

<article
  class="bg-surface-800 flex max-h-[90vh] w-3/5 flex-col items-center gap-4 overflow-auto p-10 text-white shadow-xl"
>
  <div class="static mb-8 space-y-4">
    <h2 class="h2">Add an administrator</h2>

    <div>
      <input
        class="input"
        type="text"
        placeholder="Search by name"
        bind:value={searchInput}
        on:input={searchInputHandler}
      />
    </div>
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
        {#each filteredProfiles as profile, i}
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
                on:click={() => addAdministrator(profile)}
              >
                Make admin
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</article>
