<script lang="ts">
  import type { ActionHash } from '@holochain/client';
  import { createMockedProjects } from '@mocks';
  import {
    Avatar,
    ConicGradient,
    getModalStore,
    type ConicStop,
    type ModalComponent,
    type ModalSettings
  } from '@skeletonlabs/skeleton';
  import { projects, type Project } from '@stores/projects.store';
  import { onMount } from 'svelte';
  import ProfileDetailsModal from '@lib/modals/ProfileDetailsModal.svelte';

  $: isLoading = true;
  let projectsHashes: ActionHash[];

  let pendingprojects: Project[] = [];
  let acceptedprojects: Project[] = [];
  let rejectedprojects: Project[] = [];

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
    if ($projects.length === 0) {
      const mockedprojects = await createMockedProjects(3);
      projects.set(mockedprojects);
    }

    pendingprojects = $projects.filter((Project) => Project.status === 'pending');
    acceptedprojects = $projects.filter((Project) => Project.status === 'accepted');
    rejectedprojects = $projects.filter((Project) => Project.status === 'rejected');

    isLoading = false;
    console.log('projects :', $projects);
  });
</script>

<section class="flex flex-col gap-10">
  <h1 class="h1 text-center">Projects management</h1>
  {#if isLoading && $projects.length === 0}
    <ConicGradient stops={conicStops} spin>Loading</ConicGradient>
  {/if}
  <div class="flex flex-col gap-4 lg:flex-row lg:gap-0 lg:divide-x-2">
    <div class="flex flex-col gap-4 lg:pr-4">
      <h2 class="h3">Pending projects</h2>
      {#if pendingprojects && pendingprojects.length > 0}
        <table class="table-hover table drop-shadow-lg">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each pendingprojects as profile, i}
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
                    on:click={() => modalStore.trigger(modal(i, projectsHashes[i]))}
                  >
                    View
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p>No pending projects</p>
      {/if}
    </div>
    <div class="flex flex-col gap-4 lg:pl-4">
      <h2 class="h3">Accepted projects</h2>
      {#if acceptedprojects && acceptedprojects.length > 0}
        <table class="table-hover table drop-shadow-lg">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each acceptedprojects as profile, i}
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
                    on:click={() => modalStore.trigger(modal(i, projectsHashes[i]))}
                  >
                    View
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p>No accepted projects</p>
      {/if}
    </div>
  </div>
</section>
