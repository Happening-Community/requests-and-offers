<script lang="ts">
  import Navbar from '$lib/NavBar.svelte';
  import '../app.postcss';
</script>

<Navbar />

<main
  class="container min-h-screen mx-auto flex justify-center items-center flex-col pt-40 pb-10 px-5"
>
  <slot />
</main>
