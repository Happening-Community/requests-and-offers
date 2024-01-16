import { AppAgentWebsocket, type AppAgentClient } from '@holochain/client';
import type { PageLoad } from './$types';
import { setContext } from 'svelte';
import { clientContext } from '../contexts';

export const load: PageLoad = async () => {
	// let client: AppAgentClient | undefined;
	// const hAppPath = `ws:/${process.cwd() + '/workdir/request-and-offers.happ'}` as unknown as URL;
	// client = await AppAgentWebsocket.connect(hAppPath as unknown as URL, 'request-and-offers');
	// setContext(clientContext, {
	// 	getClient: () => client
	// });
	// return client;
};
