import { AppAgentWebsocket, type AppAgentClient, type AppInfoResponse } from '@holochain/client';
import { writable, type Writable } from 'svelte/store';

/**
 * A writable Svelte store to track the connection status.
 */
export const isConnected: Writable<boolean> = writable(false);

/**
 * A service class for managing the Holochain client.
 */
class HolochainClientService {
  static instance: HolochainClientService;
  appId = 'requests_and_offers';
  client: AppAgentClient | null = null;
  hreaClient: AppAgentClient | null = null;
  loading = true;
  /**
   * Constructor for the HolochainClientService.
   * Ensures only one instance of the service is created.
   */
  constructor() {
    if (HolochainClientService.instance) {
      return HolochainClientService.instance;
    }
    HolochainClientService.instance = this;
  }

  /**
   * Connects the client to the Holochain network.
   */
  async connectClient() {
    this.client = await AppAgentWebsocket.connect(new URL('https://UNUSED'), this.appId);
    isConnected.set(true);
  }

  /**
   * Retrieves application information from the Holochain client.
   * @returns {Promise<AppInfoResponse>} - The application information.
   */
  async getAppInfo(): Promise<AppInfoResponse> {
    if (!this.client) {
      throw new Error('Client not connected');
    }
    return await this.client.appInfo();
  }

  /**
   * Returns the current client instance.
   * @returns {AppAgentClient | null} - The client instance.
   */
  getClient(): AppAgentClient | null {
    return this.client;
  }

  /**
   * Calls a zome function on the Holochain client.
   * @param {string} zomeName - The name of the zome.
   * @param {string} fnName - The name of the function within the zome.
   * @param {unknown} payload - The payload to send with the function call.
   * @param {string} roleName - The name of the role to call the function on. Defaults to 'requests_and_offers'.
   * @returns {Promise<unknown>} - The result of the zome function call.
   */
  async callZome(
    zomeName: string,
    fnName: string,
    payload: unknown,
    roleName: string = 'requests_and_offers'
  ): Promise<any> {
    if (!this.client) {
      throw new Error('Client not connected');
    }
    const record = await this.client.callZome({
      cap_secret: null,
      zome_name: zomeName,
      role_name: roleName,
      fn_name: fnName,
      payload: payload
    });
    return record;
  }

  async connectToHreaBackend() {
    // Replace 'https://hrea-backend-url' with the actual URL of your hREA backend.
    const hreaBackendUrl = 'https://hrea-backend-url';
    // Assuming the hREA backend uses a similar connection method as the Holochain client.
    // You might need to adjust this based on the actual API of the hREA backend.
    this.hreaClient = await AppAgentWebsocket.connect(new URL(hreaBackendUrl), this.appId);
    // Assuming there's a way to check if the connection is successful.
    // This is just a placeholder. You should replace it with actual logic.
    const isHreaConnected = true;
    console.log('Connected to hREA backend:', isHreaConnected);
  }
}

const hc = new HolochainClientService();
export default hc;
