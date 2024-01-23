<script>
  import { goto } from '$app/navigation';
</script>

<p class="mb-10 h3">It looks like you don't have a profile yet !</p>
<button class="btn variant-filled-primary w-fit" on:click={() => goto('/profile/create')}>
  Create profil
</button>
