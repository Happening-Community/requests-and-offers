<script lang="ts">
  import { myProfile } from '@stores/profiles.store';
  import { onMount } from 'svelte';

  onMount(async () => {
    console.log($myProfile);
  });
</script>

<section>
  <h2 class="h2">Edit Profile</h2>
</section>
