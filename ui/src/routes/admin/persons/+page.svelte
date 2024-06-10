<script lang="ts">
  import type { ActionHash } from '@holochain/client';
  import {
    Avatar,
    ConicGradient,
    getModalStore,
    type ConicStop,
    type ModalComponent,
    type ModalSettings
  } from '@skeletonlabs/skeleton';
  import { getAllProfiles, profiles, type Profile } from '@stores/profiles.store';
  import { onMount } from 'svelte';
  import ProfileDetailsModal from '@lib/modals/ProfileDetailsModal.svelte';

  $: isLoading = true;

  $: pendingProfiles = $profiles.filter((profile) => profile.status === 'pending');
  $: acceptedProfiles = $profiles.filter((profile) => profile.status === 'accepted');
  $: rejectedProfiles = $profiles.filter((profile) => profile.status === 'rejected');

  const conicStops: ConicStop[] = [
    { color: 'transparent', start: 0, end: 0 },
    { color: 'rgb(var(--color-secondary-500))', start: 75, end: 50 }
  ];

  const modalStore = getModalStore();
  const modalComponent: ModalComponent = { ref: ProfileDetailsModal };
  const modal = (profile: Profile): ModalSettings => {
    return {
      type: 'component',
      component: modalComponent,
      meta: {
        profile
      }
    };
  };

  onMount(async () => {
    await getAllProfiles();

    isLoading = false;
  });
</script>

<section class="flex flex-col gap-10">
  <h1 class="h1 text-center">Persons management</h1>
  {#if isLoading && $profiles.length === 0}
    <ConicGradient stops={conicStops} spin>Loading</ConicGradient>
  {/if}
  <div class="flex flex-col gap-4 lg:flex-row lg:gap-0 lg:divide-x-2">
    <div class="flex flex-col gap-4 lg:pr-4">
      <h2 class="h3 text-primary-400">Pending persons</h2>
      {#if pendingProfiles && pendingProfiles.length > 0}
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
            {#each pendingProfiles as profile, i}
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
                    on:click={() => modalStore.trigger(modal(profile))}
                  >
                    View
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p>No pending profiles</p>
      {/if}
    </div>
    <div class="flex flex-col gap-4 lg:pl-4">
      <h2 class="h3 text-green-600">Accepted persons</h2>
      {#if acceptedProfiles && acceptedProfiles.length > 0}
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
            {#each acceptedProfiles as profile, i}
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
                    on:click={() => modalStore.trigger(modal(profile))}
                  >
                    View
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p>No accepted profiles</p>
      {/if}
    </div>
  </div>

  <div class="flex flex-col gap-4 lg:pl-4">
    <h2 class="h3 text-red-600">Rejected persons</h2>
    {#if rejectedProfiles && rejectedProfiles.length > 0}
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
          {#each rejectedProfiles as profile, i}
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
                  on:click={() => modalStore.trigger(modal(profile))}
                >
                  View
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <p>No rejected profiles</p>
    {/if}
  </div>
</section>
