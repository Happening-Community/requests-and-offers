import { AppAgentWebsocket, type AppAgentClient, type AppInfoResponse } from '@holochain/client';

type ZomeName = 'users' | 'administration';

class HolochainClientService {
  appId = 'requests_and_offers';
  client: AppAgentClient | null = $state(null);
  isConnected = $state(false);

  /**
   * Connects the client to the Holochain network.
   */
  async connectClient() {
    this.client = await AppAgentWebsocket.connect(new URL('https://UNUSED'), this.appId);
    this.isConnected = true;
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
   * Calls a zome function on the Holochain client.
   * @param {string} zomeName - The name of the zome.
   * @param {string} fnName - The name of the function within the zome.
   * @param {unknown} payload - The payload to send with the function call.
   * @param {string} roleName - The name of the role to call the function on. Defaults to 'requests_and_offers'.
   * @returns {Promise<unknown>} - The result of the zome function call.
   */
  async callZome(
    zomeName: ZomeName,
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
}

const hc = new HolochainClientService();
export default hc;
