<script lang="ts">
  import AdminMenuLinks from './AdminMenuLinks.svelte';
</script>

<div
  class="bg-surface-900 flex h-full min-h-screen w-52 flex-col gap-5 border-2 border-b-0 border-slate-900 p-4 pt-36"
>
  <a
    href="/admin"
    class="h3 hover:text-secondary-500 hover:border-b-secondary-500 mb-4 border-b-2 border-b-white text-center text-white transition-colors duration-200 ease-in-out"
  >
    Admin Panel
  </a>
  <AdminMenuLinks />
</div>
