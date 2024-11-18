<script lang="ts">
  import { onMount } from 'svelte';
  import type { UIOrganization, UIUser } from '@/types/ui';
  import administrationStore from '@/stores/administration.store.svelte';
  import usersStore from '@/stores/users.store.svelte';
  import organizationsStore from '@/stores/organizations.store.svelte';
  import projectsStore, { type Project } from '@/stores/projects.svelte';
  import { AdministrationEntity } from '@/types/holochain';

  // Reactive state management
  let dashboardState = $state({
    isLoading: true,
    error: null as string | null,
    data: {
      administrators: [] as UIUser[],
      pendingUsers: [] as UIUser[],
      pendingProjects: [] as Project[],
      pendingOrganizations: [] as UIOrganization[]
    }
  });

  // Fetch and process dashboard data with resilient error handling
  async function fetchDashboardData() {
    try {
      dashboardState.isLoading = true;
      dashboardState.error = null;

      // Use Promise.allSettled for resilient data fetching
      const [adminResult, usersResult, organizationsResult] = await Promise.allSettled([
        administrationStore.initialize(),
        usersStore.getAllUsers(),
        organizationsStore.getAllOrganizations()
      ]);

      // Handle initialization errors
      const handleSettledResult = (result: PromiseSettledResult<any>, entityName: string) => {
        if (result.status === 'rejected') {
          console.error(`Error fetching ${entityName}:`, result.reason);
          return [];
        }
        return result.status === 'fulfilled' ? result.value : [];
      };

      // Process administrators
      dashboardState.data.administrators = administrationStore.administrators;

      // Process pending users with status filtering
      const users = handleSettledResult(usersResult, 'users');
      dashboardState.data.pendingUsers = await Promise.all(
        users.filter(async (user: UIUser) => {
          if (!user.original_action_hash) return false;
          const statusRecord = await administrationStore.getLatestStatusForEntity(
            user.original_action_hash,
            AdministrationEntity.Users
          );
          return !!statusRecord;
        })
      );

      // Process pending organizations
      const organizations = handleSettledResult(organizationsResult, 'organizations');
      dashboardState.data.pendingOrganizations = await Promise.all(
        organizations.filter(async (org: UIOrganization) => {
          if (!org.original_action_hash) return false;
          const statusRecord = await administrationStore.getLatestStatusForEntity(
            org.original_action_hash,
            AdministrationEntity.Organizations
          );
          return !!statusRecord;
        })
      );

      dashboardState.data.pendingProjects = projectsStore.projects;
    } catch (error) {
      dashboardState.error =
        error instanceof Error
          ? `Dashboard initialization failed: ${error.message}`
          : 'An unexpected error occurred while loading dashboard data';
      console.error('Dashboard data fetch error:', error);
    } finally {
      dashboardState.isLoading = false;
    }
  }

  // Initial data fetch on component mount
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

  {#if dashboardState.isLoading}
    <div class="flex items-center justify-center space-x-2 text-center">
      <span class="loading loading-spinner"></span>
      <span>Loading dashboard data...</span>
    </div>
  {:else if dashboardState.error}
    <div class="alert alert-error shadow-lg">
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 flex-shrink-0 stroke-current"
          fill="none"
          viewBox="0 0 24 24"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          /></svg
        >
        <span>{dashboardState.error}</span>
      </div>
      <div class="flex-none">
        <button class="btn btn-sm btn-ghost" onclick={fetchDashboardData}> Try Again </button>
      </div>
    </div>
  {:else}
    <div class="bg-surface-900 grid grid-cols-2 gap-4 border-2 border-slate-900 p-4">
      <div class="stat">
        <div class="stat-title">Administrators</div>
        <div class="stat-value">{dashboardState.data.administrators.length}</div>
      </div>
      <div class="stat">
        <div class="stat-title">Pending Users</div>
        <div class="stat-value">{dashboardState.data.pendingUsers.length}</div>
      </div>
      <div class="stat">
        <div class="stat-title">Pending Projects</div>
        <div class="stat-value">{dashboardState.data.pendingProjects.length}</div>
      </div>
      <div class="stat">
        <div class="stat-title">Pending Organizations</div>
        <div class="stat-value">{dashboardState.data.pendingOrganizations.length}</div>
      </div>
    </div>
  {/if}
</section>
