<script lang="ts">
  import type { ActionHash } from '@holochain/client';
  import { createMockedOrganizations } from '@mocks';
  import {
    Avatar,
    ConicGradient,
    getModalStore,
    type ConicStop,
    type ModalComponent,
    type ModalSettings
  } from '@skeletonlabs/skeleton';
  import { organizations, type Organization } from '@stores/organizations.store';
  import { onMount } from 'svelte';
  import ProfileDetailsModal from '@lib/modals/ProfileDetailsModal.svelte';

  $: isLoading = true;
  let organizationsHashes: ActionHash[];

  let pendingOrganizations: Organization[] = [];
  let acceptedOrganizations: Organization[] = [];
  let rejectedOrganizations: Organization[] = [];

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

  const conicStops: ConicStop[] = [
    { color: 'transparent', start: 0, end: 0 },
    { color: 'rgb(var(--color-secondary-500))', start: 75, end: 50 }
  ];

  onMount(async () => {
    if ($organizations.length === 0) {
      const mockedOrganizations = await createMockedOrganizations(3);
      organizations.set(mockedOrganizations);
    }

    pendingOrganizations = $organizations.filter(
      (organization) => organization.status === 'pending'
    );
    acceptedOrganizations = $organizations.filter(
      (organization) => organization.status === 'accepted'
    );
    rejectedOrganizations = $organizations.filter(
      (organization) => organization.status === 'rejected'
    );

    isLoading = false;
  });
</script>

<section class="flex flex-col gap-10">
  <h1 class="h1 text-center">Organizations management</h1>
  {#if isLoading && $organizations.length === 0}
    <ConicGradient stops={conicStops} spin>Loading</ConicGradient>
  {/if}
  <div class="flex flex-col gap-4 lg:flex-row lg:gap-0 lg:divide-x-2">
    <div class="flex flex-col gap-4 lg:pr-4">
      <h2 class="h3">Pending organizations</h2>
      {#if pendingOrganizations && pendingOrganizations.length > 0}
        <table class="table-hover table drop-shadow-lg">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each pendingOrganizations as profile, i}
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
                  <button
                    class="btn variant-filled-secondary"
                    on:click={() => modalStore.trigger(modal(i, organizationsHashes[i]))}
                  >
                    View
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p>No pending organizations</p>
      {/if}
    </div>
    <div class="flex flex-col gap-4 lg:pl-4">
      <h2 class="h3">Accepted organizations</h2>
      {#if acceptedOrganizations && acceptedOrganizations.length > 0}
        <table class="table-hover table drop-shadow-lg">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each acceptedOrganizations as profile, i}
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
                  <button
                    class="btn variant-filled-secondary"
                    on:click={() => modalStore.trigger(modal(i, organizationsHashes[i]))}
                  >
                    View
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p>No accepted organizations</p>
      {/if}
    </div>
  </div>
</section>
