<script lang="ts">
  import Bars from '$lib/assets/svg/bars.svelte';
</script>

<nav class="bg-primary-500 flex p-4 justify-between items-center h-32 absolute w-full">
  <a href="/" class="w-1/3"><img src="/hAppeningsLogoWsun2.webp" alt="" class="w-28" /></a>

  <h1 class="h2 text-white text-center">Requests and Offers hApp</h1>

  <div class="w-1/3 flex justify-end">
    <button type="button" class="btn variant-filled-secondary p-4 group">
      <Bars svgClass={`fill-[#4720b7] group-hover:fill-white`} />
    </button>
  </div>
</nav>
