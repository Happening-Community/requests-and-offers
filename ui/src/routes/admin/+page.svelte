<script>
  import { administrators, allProfiles } from '@stores/administrators.store';
  import { organizations } from '@stores/organizations.store';
  import { projects } from '@stores/projects.store';

  $: pendingPersons = $allProfiles.filter((p) => p.status === 'pending');
  $: pendingprojects = $projects.filter((p) => p.status === 'pending');
  $: pendingOrganizations = $organizations.filter((o) => o.status === 'pending');
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
    <p># of administrators : {$administrators.length}</p>
    <p># of pending Persons : {pendingPersons.length}</p>
    <p># of pending Projects : {pendingprojects.length}</p>
    <p># of pending Organizations : {pendingOrganizations.length}</p>
  </div>
</section>
