<script lang="ts">
  import type { User } from '@/stores/users.svelte';
  import administratorsStore from '@stores/administrators.svelte';
  import { type Organization } from '@stores/organizations.svelte';
  ('@stores/organizations.svelte');
  import projectsStore, { type Project } from '@stores/projects.svelte';
  import { onMount } from 'svelte';

  const { allUsers, allOrganizations, administrators } = $derived(administratorsStore);
  const { projects } = projectsStore;

  let pendingUsers: User[] = $state([]);
  let pendingprojects: Project[] = $state([]);
  let pendingOrganizations: Organization[] = $state([]);

  onMount(async () => {
    for (let user of allUsers) {
      if (!user.status) continue;
      const status = await administratorsStore.getLatestStatus(user.status);

      if (status!.status_type === 'pending') pendingUsers.push(user);
    }

    pendingprojects = projects.filter((Project) => Project.status === 'pending');

    for (const organization of allOrganizations) {
      const status = await administratorsStore.getLatestStatus(organization.status!);
      if (status === null) continue;

      if (status.status_type === 'pending') pendingOrganizations.push(organization);
    }
  });
</script>

<section class="space-y-8">
  <div class="absolute left-10 top-40 flex flex-col items-center gap-2 sm:left-56 sm:top-40">
    <a class="btn bg-secondary-500 text-slate-800 hover:text-black" href="/"> User front-end </a>
    <span
      ><kbd class="kbd !bg-secondary-400 text-black">Alt</kbd> +
      <kbd class="kbd !bg-secondary-400 text-black">A</kbd></span
    >
  </div>

  <h1 class="h1">Admin Dashboard</h1>

  <div class="bg-surface-900 space-y-2 border-2 border-slate-900 p-4">
    <p># of administrators : {administrators.length}</p>
    <p># of pending Users : {pendingUsers.length}</p>
    <p># of pending Projects : {pendingprojects.length}</p>
    <p># of pending Organizations : {pendingOrganizations.length}</p>
  </div>
</section>
