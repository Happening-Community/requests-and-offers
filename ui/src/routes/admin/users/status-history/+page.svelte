<script lang="ts">
  import StatusTable from '@lib/tables/StatusTable.svelte';
  import administrationStore from '@stores/administration.store.svelte';
  import { onMount } from 'svelte';
  import type { Revision } from '@/types/ui';

  let allRevisions: Revision[] = [];

  onMount(async () => {
    const userRevisions = await administrationStore.getAllRevisionsForAllUsers();
    const orgRevisions = await administrationStore.getAllRevisionsForAllOrganizations();

    console.log(
      'User Revisions:',
      userRevisions.map((r) => ({
        timestamp: r.timestamp,
        formattedDate: new Date(r.timestamp).toLocaleString(),
        entity: r.entity.name
      }))
    );

    console.log(
      'Org Revisions:',
      orgRevisions.map((r) => ({
        timestamp: r.timestamp,
        formattedDate: new Date(r.timestamp).toLocaleString(),
        entity: r.entity.name
      }))
    );

    allRevisions = [...userRevisions, ...orgRevisions].sort((a, b) => b.timestamp - a.timestamp);
  });
</script>

<section class="space-y-10">
  <h1 class="h1 text-center">Status History</h1>

  <StatusTable statusHistory={allRevisions} />
</section>
