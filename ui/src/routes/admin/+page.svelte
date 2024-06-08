<script>
  import { administrators } from '@stores/administrators.store';
  import { organizations } from '@stores/organizations.store';
  import { profiles } from '@stores/profiles.store';
  import { projects } from '@stores/projects.store';

  $: pendingPersons = $profiles.filter((p) => p.status === 'pending');
  $: pendingprojects = $projects.filter((p) => p.status === 'pending');
  $: pendingOrganizations = $organizations.filter((o) => o.status === 'pending');
</script>

<section class="space-y-8">
  <h1 class="h1">Admin Dashboard</h1>

  <div class="bg-surface-900 space-y-2 border-2 border-slate-900 p-4">
    <p># of administrators : {$administrators.length}</p>
    <p># of pending Persons : {pendingPersons.length}</p>
    <p># of pending Projects : {pendingprojects.length}</p>
    <p># of pending Organizations : {pendingOrganizations.length}</p>
  </div>
</section>
