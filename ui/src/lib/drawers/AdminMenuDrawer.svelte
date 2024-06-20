<script>
  import AdminMenuLinks from '@lib/AdminMenuLinks.svelte';
  import { getDrawerStore } from '@skeletonlabs/skeleton';

  const drawerStore = getDrawerStore();
</script>

<div class="h-10 space-y-5 p-2 md:p-5">
  <div class="flex items-center justify-center gap-4">
    <a href="/" on:click={() => drawerStore.close()}>
      <img src="/hAppeningsLogoWsun2.webp" alt="" class="w-28" />
    </a>
    <a
      href="/admin"
      class="h3 hover:text-secondary-500 hover:border-b-secondary-500 text-center text-white transition-colors duration-200 ease-in-out"
      on:click={() => drawerStore.close()}
    >
      Admin Panel
    </a>
  </div>

  <AdminMenuLinks />
</div>
