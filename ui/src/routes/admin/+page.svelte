<script lang="ts">
  import { onMount } from 'svelte';
  import type { UIOrganization } from '@/types/ui';
  import type { UIUser } from '@/types/ui';
  import administrationStore from '@/stores/administration.store.svelte';
  import usersStore from '@/stores/users.store.svelte';
  import organizationsStore from '@/stores/organizations.store.svelte';
  import projectsStore, { type Project } from '@stores/projects.svelte';
  import { AdministrationEntity } from '@/types/holochain';
  import { decodeRecords } from '@/utils';

  const { administrators } = $derived(administrationStore);
  const { projects } = projectsStore;

  let users: UIUser[] = $state([]);
  let organizations: UIOrganization[] = $state([]);
  let pendingUsers: UIUser[] = $state([]);
  let pendingprojects: Project[] = $state([]);
  let pendingOrganizations: UIOrganization[] = $state([]);

  onMount(async () => {
    await administrationStore.initialize();

    users = await usersStore.getAllUsers();
    organizations = await organizationsStore.getAllOrganizations();

    // Process pending users
    pendingUsers = users.filter(async (user) => {
      if (!user.status) return false;
      const record = await administrationStore.getLatestStatusForEntity(
        user.original_action_hash!,
        AdministrationEntity.Users
      );

      return record ? decodeRecords([record])[0] : null;
    });

    // Process pending projects
    pendingprojects = projects.filter((project) => project.status === 'pending');

    // Process pending organizations
    pendingOrganizations = organizations.filter(async (organization) => {
      const record = await administrationStore.getLatestStatusForEntity(
        organization.original_action_hash!,
        AdministrationEntity.Organizations
      );
      return record ? decodeRecords([record])[0] : null;
    });
  });
</script>

<section class="space-y-8">
  <div class="absolute left-10 top-40 flex flex-col items-center gap-2 sm:left-56 sm:top-40">
    <a class="btn bg-secondary-500 text-slate-800 hover:text-black" href="/"> User front-end </a>
    <span>
      <kbd class="kbd !bg-secondary-400 text-black">Alt</kbd> +
      <kbd class="kbd !bg-secondary-400 text-black">A</kbd>
    </span>
  </div>

  <h1 class="h1">Admin Dashboard</h1>

  <div class="bg-surface-900 space-y-2 border-2 border-slate-900 p-4">
    <p># of administrators : {administrators.length}</p>
    <p># of pending Users : {pendingUsers.length}</p>
    <p># of pending Projects : {pendingprojects.length}</p>
    <p># of pending Organizations : {pendingOrganizations.length}</p>
  </div>
</section>
