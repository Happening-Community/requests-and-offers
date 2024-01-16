<script lang="ts">
	// import { clientContext } from "../contexts";

	import { FileDropzone, InputChip } from '@skeletonlabs/skeleton';

	let files: FileList;
	let fileMessage: HTMLParagraphElement;

	function onPictureFileChange(evt: Event) {
		console.log(evt);
		console.log(files);
	}
</script>

<section class="flex flex-col gap-10">
	<h2 class="h2">Create Profile</h2>

	<form class="flex flex-col gap-4" method="post">
		<label class="label text-lg"
			>Name :<input type="text" class="input" name="name" required /></label
		>

		<label class="label text-lg">
			Nickname :
			<input type="text" class="input" name="nickname" required />
		</label>

		<label class="label text-lg">Bio :<textarea class="textarea" name="bio" /></label>

		<p class="label text-lg">Profile picture :</p>
		<FileDropzone name="files" bind:files on:change={onPictureFileChange} />
		<p bind:this={fileMessage} />

		<div class="flex gap-6">
			<p class="label text-lg">Type :</p>

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

		<InputChip id="skills" name="skills" placeholder="Your skills" />

		<label class="label text-lg">
			Email :
			<input type="email" class="input" name="email" />
		</label>

		<label class="label text-lg">
			Phone number :
			<input type="text" class="input" name="phone" />
		</label>

		<label class="label text-lg">
			Time Zone :
			<input type="text" class="input" name="timezone" />
		</label>

		<label class="label text-lg">
			Location :
			<input type="text" class="input" name="location" />
		</label>

		<button type="submit" class="btn variant-filled-primary w-fit self-center"> Submit </button>
	</form>
</section>
