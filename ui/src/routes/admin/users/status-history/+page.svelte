<script lang="ts">
  import administratorsStore from '@stores/administrators.svelte';
  import { onMount } from 'svelte';

  onMount(async () => {
    await administratorsStore.getAllRevisionsForAllUsers();
    console.log(administratorsStore.allStatusHistory);
  });
</script>

<h1 class="h1 text-center">Status History</h1>

<ul>
  {#each administratorsStore.allStatusHistory as statusHistoryItem}
    <ul>
      {new Date(statusHistoryItem.timestamp).toLocaleString()} - {statusHistoryItem.user.name} - {statusHistoryItem
        .status.status_type}
    </ul>
  {/each}
</ul>
