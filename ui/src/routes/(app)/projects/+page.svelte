<script lang="ts">
  import { createMockedProjects } from '@mocks';
  import { Avatar, ConicGradient, type ConicStop } from '@skeletonlabs/skeleton';
  import projectsStore from '@stores/projects.svelte';
  import { onMount } from 'svelte';

  let isLoading = $state(true);

  const { projects } = $derived(projectsStore);

  const conicStops: ConicStop[] = [
    { color: 'transparent', start: 0, end: 0 },
    { color: 'rgb(var(--color-primary-500))', start: 75, end: 50 }
  ];

  onMount(async () => {
    if (projects.length === 0) {
      const mockedProjects = await createMockedProjects(3);
      projectsStore.projects = mockedProjects;
    }
    isLoading = false;
  });
</script>

<section class="flex flex-col gap-8">
  <h1 class="h1">Projects</h1>

  {#if isLoading}
    <ConicGradient stops={conicStops} spin>Loading</ConicGradient>
  {:else}
    <table class="table">
      <thead>
        <tr>
          <th class="text-center">Logo</th>
          <th class="text-center">Name</th>
          <th class="text-center">Description</th>
          <th class="text-center"># Members</th>
        </tr>
      </thead>
      <tbody>
        {#each projects as project}
          <tr>
            <td class="text-center">
              <Avatar
                src={project.picture
                  ? URL.createObjectURL(new Blob([new Uint8Array(project.picture)]))
                  : '/default_avatar.webp'}
              />
            </td>
            <td class="text-center">{project.name}</td>
            <td class="text-center">{project.description}</td>
            <td class="text-center">{project.team_members.length}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</section>
