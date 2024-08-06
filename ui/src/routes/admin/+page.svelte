<script>
  import administratorsStore from '@stores/administrators.svelte';
  import organizationsStore from '@stores/organizations.svelte';
  ('@stores/organizations.svelte');
  import projectsStore from '@stores/projects.svelte';

  const { allUsers, administrators } = $derived(administratorsStore);
  const { organizations } = organizationsStore;
  const { projects } = projectsStore;

  let pendingUsers = $derived(allUsers.filter((p) => p.status === 'pending'));
  let pendingprojects = $state(projects.filter((p) => p.status === 'pending'));
  let pendingOrganizations = $state(organizations.filter((o) => o.status === 'pending'));
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
