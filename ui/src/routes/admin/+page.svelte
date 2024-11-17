<script lang="ts">
  import { onMount } from 'svelte';
  import type { UIOrganization, UIUser } from '@/types/ui';
  import administrationStore from '@/stores/administration.store.svelte';
  import usersStore from '@/stores/users.store.svelte';
  import organizationsStore from '@/stores/organizations.store.svelte';
  import { type Project } from '@stores/projects.svelte';
  import { AdministrationEntity } from '@/types/holochain';

  // State management
  let isLoading = $state(true);
  let error: string | null = $state(null);

  // Dashboard data
  let dashboardData = $state({
    administrators: [] as UIUser[],
    pendingUsers: [] as UIUser[],
    pendingProjects: [] as Project[],
    pendingOrganizations: [] as UIOrganization[]
  });

  // Derived administrators from store
  const { administrators } = $derived(administrationStore);

  // Fetch and process data with error handling
  async function fetchDashboardData() {
    try {
      isLoading = true;
      error = null;

      // Initialize administration store and fetch users/organizations
      await Promise.all([
        administrationStore.initialize(),
        usersStore.getAllUsers(),
        organizationsStore.getAllOrganizations()
      ]);

      // Set administrators from derived store
      dashboardData.administrators = administrators;

      // Process users
      const users = await usersStore.getAllUsers();
      dashboardData.pendingUsers = await Promise.all(
        users.filter(async (user) => {
          if (!user.status) return false;
          const statusRecord = await administrationStore.getLatestStatusForEntity(
            user.original_action_hash!,
            AdministrationEntity.Users
          );
          return !!statusRecord;
        })
      );

      // Process organizations
      const organizations = await organizationsStore.getAllOrganizations();
      dashboardData.pendingOrganizations = await Promise.all(
        organizations.filter(async (org) => {
          const statusRecord = await administrationStore.getLatestStatusForEntity(
            org.original_action_hash!,
            AdministrationEntity.Organizations
          );
          return !!statusRecord;
        })
      );
    } catch (fetchError) {
      error =
        fetchError instanceof Error
          ? fetchError.message
          : 'An unexpected error occurred while fetching dashboard data';
    } finally {
      isLoading = false;
    }
  }

  onMount(fetchDashboardData);
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

  {#if isLoading}
    <div class="text-center">Loading dashboard data...</div>
  {:else if error}
    <div class="text-error-500 text-center">
      Error loading dashboard: {error}
      <button onclick={fetchDashboardData} class="btn variant-filled-primary"> Retry </button>
    </div>
  {:else}
    <div class="bg-surface-900 space-y-2 border-2 border-slate-900 p-4">
      <p># of administrators: {dashboardData.administrators.length}</p>
      <p># of pending Users: {dashboardData.pendingUsers.length}</p>
      <p># of pending Projects: {dashboardData.pendingProjects.length}</p>
      <p># of pending Organizations: {dashboardData.pendingOrganizations.length}</p>
    </div>
  {/if}
</section>
