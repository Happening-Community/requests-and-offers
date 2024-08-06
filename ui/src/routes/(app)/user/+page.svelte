<script lang="ts">
  import { getMyUser, myUser } from '@stores/users.store';
  import { Avatar } from '@skeletonlabs/skeleton';
  import NavButton from '@lib/NavButton.svelte';
  import { onMount } from 'svelte';

  $: userPictureUrl = $myUser?.picture
    ? URL.createObjectURL(new Blob([new Uint8Array($myUser.picture)]))
    : '/default_avatar.webp';

  let suspensionDate: string;
  let isExpired: boolean;

  onMount(async () => {
    await getMyUser();

    if ($myUser) {
      if ($myUser.status!.split(' ')[1]) {
        const date = new Date($myUser.status!.split(' ')[1]);
        const dateString = date.toString();
        const now = new Date();

        isExpired = date < now;

        suspensionDate = dateString.substring(0, dateString.indexOf(' ', 15));
      }
    }
  });
</script>

<section class="flex flex-col items-center">
  {#if !$myUser}
    <p class="mb-4 text-center text-xl">It looks like you don't have a user profile yet !</p>
    <NavButton href="/user/create">Create Profile</NavButton>
  {:else}
    <div class="mb-10 flex flex-col items-center gap-5">
      <h2 class="h2">
        Welcome <span class="text-primary-500 font-bold">{$myUser.name}</span> !
      </h2>
      <a href="/user/edit" class="btn variant-filled-primary w-fit text-white">Edit profile</a>
    </div>
    <div
      class="border-surface-600 bg-surface-400 flex w-4/5 min-w-96 flex-col items-center gap-5 rounded-xl border-8 p-5 drop-shadow-xl"
    >
      <h3 class="h3"><b>Nickname :</b> {$myUser.nickname}</h3>
      <h3 class="h3 text-wrap text-center">
        <b>Status :</b>
        <span
          class:text-primary-500={$myUser.status === 'pending'}
          class:text-error-500={$myUser.status === 'rejected' || $myUser.status === 'suspended'}
          class:text-green-400={$myUser.status === 'accepted'}
          class:text-warning-500={$myUser.status === `suspended ${$myUser.status?.split(' ')[1]}`}
        >
          {#if !suspensionDate}
            {$myUser.status}
          {:else}
            {isExpired ? 'In review' : `suspended until ${suspensionDate}.`}
          {/if}
        </span>
      </h3>
      <div onload={() => URL.revokeObjectURL(userPictureUrl)}>
        <Avatar src={userPictureUrl} width="w-64" background="none" />
      </div>
      <p class="text-center">{$myUser.bio}</p>
      <p><b>Type :</b> {$myUser.user_type}</p>
      {#if $myUser.skills?.length}
        <p class="text-center"><b>Skills :</b> {$myUser.skills?.join(', ')}</p>
      {/if}
      <p><b>Email :</b> {$myUser.email}</p>
      {#if $myUser.phone}
        <p><b>Phone number :</b> {$myUser.phone}</p>
      {/if}
      {#if $myUser.time_zone}
        <p><b>Timezone :</b> {$myUser.time_zone}</p>
      {/if}
      {#if $myUser.location}
        <p><b>Location :</b> {$myUser.location}</p>
      {/if}
    </div>
  {/if}
</section>
