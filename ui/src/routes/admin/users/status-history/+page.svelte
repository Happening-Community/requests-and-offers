<script lang="ts">
  import StatusTable from '@lib/tables/StatusTable.svelte';
  import administratorsStore from '@stores/administrators.svelte';
  import { onMount } from 'svelte';

  onMount(async () => {
    await administratorsStore.getAllRevisionsForAllUsers();
  });
</script>

<section class="space-y-10">
  <h1 class="h1 text-center">Status History</h1>

  <StatusTable statusHistory={administratorsStore.allStatusesHistory} />
</section>
