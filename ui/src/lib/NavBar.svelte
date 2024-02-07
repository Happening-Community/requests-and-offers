<script lang="ts">
  import Bars from '$lib/assets/svg/bars.svelte';
</script>

<nav class="bg-primary-500 absolute flex h-32 w-full items-center justify-between p-4">
  <a href="/" class="w-1/3"><img src="/hAppeningsLogoWsun2.webp" alt="" class="w-28" /></a>

  <h1 class="h2 text-center text-white">Requests and Offers hApp</h1>

  <div class="flex w-1/3 justify-end">
    <button type="button" class="btn variant-filled-secondary group p-4">
      <Bars svgClass={`fill-[#4720b7] group-hover:fill-white`} />
    </button>
  </div>
</nav>
