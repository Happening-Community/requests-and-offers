<script>
  import { profiles } from '@stores/profiles.store';
</script>

<section class="space-y-8">
  <h1 class="h1 text-white">Admin Dashboard</h1>

  <div class="bg-surface-900 border-2 border-slate-900 p-4">
    <p># of administrators : {$profiles.length}</p>
    <p># of pending Persons : {$profiles.length}</p>
  </div>
</section>
