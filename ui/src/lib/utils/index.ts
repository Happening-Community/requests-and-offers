export function bufferToBase64(buffer: ArrayBuffer) {
	return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

export function base64ToBuffer(base64: string) {
	const binaryString = atob(base64);
	const length = binaryString.length;
	const bytes = new Uint8Array(new ArrayBuffer(length));

	for (let i = 0; i < length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}

	return bytes;
}
