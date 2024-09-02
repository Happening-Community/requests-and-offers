<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton';
  import NavButton from '@lib/NavButton.svelte';
  import { onMount } from 'svelte';
  import usersStore from '@stores/users.svelte';

  const { myProfile } = $derived(usersStore);

  let userPictureUrl = $derived(
    myProfile?.picture
      ? URL.createObjectURL(new Blob([new Uint8Array(myProfile.picture)]))
      : '/default_avatar.webp'
  );

  let suspensionDate = $state('');
  let isExpired = $state(false);

  onMount(async () => {
    await usersStore.getMyProfile();

    if (myProfile) {
      if (myProfile.status!.suspended_until) {
        const date = new Date(myProfile.status!.suspended_until);
        const dateString = date.toString();
        const now = new Date();

        isExpired = date < now;

        suspensionDate = dateString.substring(0, dateString.indexOf(' ', 15));
      }
    }
  });
</script>

<section class="flex flex-col items-center">
  {#if !myProfile}
    <p class="mb-4 text-center text-xl">It looks like you don't have a user profile yet !</p>
    <NavButton href="/user/create">Create Profile</NavButton>
  {:else}
    <div class="mb-10 flex flex-col items-center gap-5">
      <h2 class="h2">
        Welcome <span class="text-primary-500 font-bold">{myProfile.name}</span> !
      </h2>
      <a href="/user/edit" class="btn variant-filled-primary w-fit text-white">Edit profile</a>
    </div>
    <div
      class="border-surface-600 bg-surface-400 flex w-4/5 min-w-96 flex-col items-center gap-5 rounded-xl border-8 p-5 drop-shadow-xl"
    >
      <h3 class="h3"><b>Nickname :</b> {myProfile.nickname}</h3>
      <h3 class="h3 text-wrap text-center">
        <b>Status :</b>
        <span
          class:text-primary-500={myProfile.status?.status_type === 'pending'}
          class:text-error-500={myProfile.status?.status_type === 'rejected' ||
            myProfile.status?.status_type === 'suspended indefinitely'}
          class:text-green-400={myProfile.status?.status_type === 'accepted'}
          class:text-warning-500={myProfile.status?.status_type === `suspended temporarily`}
        >
          {#if !suspensionDate}
            {myProfile.status?.status_type}
          {:else}
            {isExpired ? 'In review' : `suspended until ${suspensionDate}.`}
          {/if}
        </span>
      </h3>
      {#if myProfile.status?.status_type.startsWith('suspended')}
        <p class=" text-wrap text-center"><b>Reason :</b> {myProfile.status?.reason}</p>
      {/if}
      <div onload={() => URL.revokeObjectURL(userPictureUrl)}>
        <Avatar src={userPictureUrl} width="w-64" background="none" />
      </div>
      <p class="text-center">{myProfile.bio}</p>
      <p><b>Type :</b> {myProfile.user_type}</p>
      {#if myProfile.skills?.length}
        <p class="text-center"><b>Skills :</b> {myProfile.skills?.join(', ')}</p>
      {/if}
      <p><b>Email :</b> {myProfile.email}</p>
      {#if myProfile.phone}
        <p><b>Phone number :</b> {myProfile.phone}</p>
      {/if}
      {#if myProfile.time_zone}
        <p><b>Timezone :</b> {myProfile.time_zone}</p>
      {/if}
      {#if myProfile.location}
        <p><b>Location :</b> {myProfile.location}</p>
      {/if}
    </div>
  {/if}
</section>
