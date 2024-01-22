<script lang="ts">
	import moment from 'moment-timezone';

	import { FileDropzone, InputChip } from '@skeletonlabs/skeleton';
	import { myProfile } from '$lib/stores/profiles.js';

	export let form;

	type FormattedTimezone = {
		name: string;
		formatted: string;
		offset: number;
	};

	let files: FileList;
	let fileMessage: HTMLParagraphElement;
	let timezones = moment.tz.names();
	let filteredTimezones: string[] = [];
	let formattedTimezones: FormattedTimezone[] = [];
	let search = '';

	function getOffset(timezone: string) {
		return moment.tz(timezone).utcOffset();
	}

	function formatTimezones(timezones: string[]): FormattedTimezone[] {
		return timezones.map((timezone) => {
			const offset = getOffset(timezone);
			const hours = Math.floor(Math.abs(offset) / 60);
			const minutes = Math.abs(offset) % 60;
			const sign = offset >= 0 ? '+' : '-';

			const formatted = `GMT${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${timezone}`;

			return {
				name: timezone,
				formatted,
				offset
			};
		});
	}

	$: search
		? (formattedTimezones = formatTimezones(filteredTimezones).sort((a, b) => a.offset - b.offset))
		: (formattedTimezones = formatTimezones(timezones)).sort((a, b) => a.offset - b.offset);

	function filterTimezones(event: any) {
		search = event.target.value.trim();
		filteredTimezones = timezones.filter((tz) => tz.toLowerCase().includes(search.toLowerCase()));
	}

	function onPictureFileChange() {
		fileMessage.innerHTML = `${files[0].name}`;
	}
</script>

<section class="flex flex-col gap-10 w-1/2">
	<h2 class="h2">Create Profile</h2>

	{#if $myProfile}
		<p>Profile already created.</p>
	{:else}
		{#if form?.success === false}
			<p class="text-red-500">An error occured</p>
		{/if}
		{#if form?.success}
			<p class="text-green-500">Profile Created successfully</p>
		{/if}
		<form id="form" class="flex flex-col gap-4" method="post" enctype="multipart/form-data">
			<p>*required fields</p>
			<label class="label text-lg">
				Name* :<input type="text" class="input" name="name" required />
			</label>

			<label class="label text-lg">
				Nickname* :
				<input type="text" class="input" name="nickname" required />
			</label>

			<label class="label text-lg">
				Bio :
				<textarea class="textarea" name="bio" />
			</label>

			<p class="label text-lg">Profile picture :</p>
			<FileDropzone name="picture" bind:files on:change={onPictureFileChange} accept="image/*" />
			<p class="italic" bind:this={fileMessage} />

			<div class="flex gap-6">
				<p class="label text-lg">Type* :</p>

				<div class="flex gap-4">
					<label class="label flex items-center gap-2">
						<input type="radio" name="individual_type" value="advocate" required />
						Advocate
					</label>
					<label class="label flex items-center gap-2">
						<input type="radio" name="individual_type" value="developer" />
						Developer
					</label>
				</div>
			</div>

			<div class="flex gap-5">
				<p class="label text-lg w-16">Skills :</p>
				<InputChip
					id="skills"
					name="skills"
					placeholder="Your skills"
					chips="variant-filled-secondary"
				/>
			</div>

			<label class="label text-lg">
				Email* :
				<input type="email" class="input" name="email" />
			</label>

			<label class="label text-lg">
				Phone number :
				<input type="text" class="input" name="phone" />
			</label>

			<label class="label text-lg">
				Time Zone :
				<input
					type="text"
					placeholder="Search timezones..."
					class="input w-1/2"
					on:input={filterTimezones}
				/>
				<select name="timezone" id="timezone" class="select">
					{#each formattedTimezones as tz}
						<option class="" value={tz.name}>{tz.formatted}</option>
					{/each}
				</select>
			</label>

			<label class="label text-lg">
				Location :
				<input type="text" class="input" name="location" />
			</label>

			<button type="submit" class="btn variant-filled-primary w-fit self-center">Submit</button>
		</form>
	{/if}
</section>
