<script lang="ts">
  import StatusTable from '@lib/tables/StatusTable.svelte';
  import administrationStore from '@stores/administration.store';
  import { onMount } from 'svelte';

  onMount(async () => {
    await administrationStore.getAllRevisionsForAllUsers();
  });
</script>

<section class="space-y-10">
  <h1 class="h1 text-center">Status History</h1>

  <StatusTable statusHistory={administrationStore.allStatusesHistory} />
</section>
