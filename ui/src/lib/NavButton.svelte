<script lang="ts">
  import { goto } from '$app/navigation';

  export let className: string = 'variant-filled-primary w-fit',
    href: string,
    text: string;
</script>

<button class="btn {className}" on:click={() => goto(href)}>{text}</button>
