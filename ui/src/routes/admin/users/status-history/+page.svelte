<script lang="ts">
  import StatusTable from '@lib/tables/StatusTable.svelte';
  import administrationStore from '@stores/administration.store.svelte';
  import { onMount } from 'svelte';

  onMount(async () => {
    await administrationStore.getAllRevisionsForAllUsers();
  });
</script>

<section class="space-y-10">
  <h1 class="h1 text-center">Status History</h1>

  <StatusTable 
    username={administrationStore.allStatusesHistory[0]?.user?.name ?? 'Unknown'}
    statusHistory={administrationStore.allStatusesHistory} 
  />
</section>
