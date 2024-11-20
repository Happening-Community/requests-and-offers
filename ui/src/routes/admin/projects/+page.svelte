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
  import projectsStore, { type Project, type ProjectStatus } from '@stores/projects.svelte';
  import { onMount } from 'svelte';
  import UserDetailsModal from '@lib/modals/UserDetailsModal.svelte';
  import administrationStore from '@stores/administration.store.svelte';

  // Type-safe state management
  let isLoading = $state<boolean>(true);
  let projectsHashes = $state<ActionHash[]>([]);
  let error = $state<string | null>(null);

  // Reactive state for categorized projects
  let projectsByStatus = $state<Record<ProjectStatus, Project[]>>({
    pending: [],
    accepted: [],
    rejected: []
  });

  // Derived store for projects
  const { projects } = $derived(projectsStore);

  // Modal configuration
  const modalStore = getModalStore();
  const modalComponent: ModalComponent = { ref: UserDetailsModal };
  const modal = (id: number, hash: ActionHash): ModalSettings => ({
    type: 'component',
    component: modalComponent,
    meta: { id, hash }
  });

  // Loading and error handling
  async function loadProjects() {
    try {
      isLoading = true;
      error = null;

      // If no projects, create mocked data
      if (projects.length === 0) {
        const mockedProjects = await createMockedProjects(3);
        projectsStore.projects = mockedProjects;
      }

      // Categorize projects by status
      projectsByStatus = {
        pending: projects.filter(project => project.status === 'pending'),
        accepted: projects.filter(project => project.status === 'accepted'),
        rejected: projects.filter(project => project.status === 'rejected')
      };

      // Update project hashes for modal interactions
      projectsHashes = projects.map(project => project.admins[0]); // Assuming first admin's hash

    } catch (err) {
      error = err instanceof Error 
        ? `Failed to load projects: ${err.message}` 
        : 'An unexpected error occurred while loading projects';
      console.error(error);
    } finally {
      isLoading = false;
    }
  }

  // Lifecycle hook
  onMount(loadProjects);

  // Loading spinner configuration
  const conicStops: ConicStop[] = [
    { color: 'transparent', start: 0, end: 0 },
    { color: 'rgb(var(--color-secondary-500))', start: 75, end: 50 }
  ];
</script>

<section class="flex flex-col gap-10">
  <h1 class="h1 text-center">Projects Management</h1>

  {#if isLoading}
    <div class="flex justify-center">
      <ConicGradient stops={conicStops} spin>Loading</ConicGradient>
    </div>
  {:else if error}
    <div class="alert variant-filled-error">
      <p>{error}</p>
      <button class="btn btn-sm variant-soft" onclick={loadProjects}>
        Retry
      </button>
    </div>
  {:else}
    <div class="flex flex-col gap-4 lg:flex-row lg:gap-0 lg:divide-x-2">
      {#each Object.entries(projectsByStatus) as [status, categoryProjects]}
        <div class="flex flex-col gap-4 lg:px-4">
          <h2 class="h3 capitalize">{status} Projects</h2>
          {#if categoryProjects.length > 0}
            <table class="table-hover table drop-shadow-lg">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {#each categoryProjects as project, i}
                  <tr>
                    <td>
                      <Avatar
                        src={project.picture
                          ? URL.createObjectURL(new Blob([new Uint8Array(project.picture)]))
                          : '/default_avatar.webp'}
                      />
                    </td>
                    <td>{project.name}</td>
                    <td>
                      <button
                        class="btn variant-filled-secondary"
                        onclick={() => modalStore.trigger(modal(i, projectsHashes[i]))}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {:else}
            <p class="text-surface-500 text-center">No {status} projects</p>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</section>
