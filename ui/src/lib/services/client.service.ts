import {
  AppAgentWebsocket,
  type AppAgentClient,
  type AppInfoResponse,
  type Record
} from '@holochain/client';
import { decode } from '@msgpack/msgpack';

class HolochainClientService {
  static instance: HolochainClientService;
  client: AppAgentClient | null = null;
  loading = true;

  constructor() {
    if (HolochainClientService.instance) {
      return HolochainClientService.instance;
    }
    HolochainClientService.instance = this;
  }

  async connectClient() {
    this.client = await AppAgentWebsocket.connect(new URL('https://UNUSED'), 'requests-and-offers');
    this.loading = false;
  }

  async getAppInfo(): Promise<AppInfoResponse> {
    if (!this.client) {
      throw new Error('Client not connected');
    }
    return await this.client.appInfo();
  }

  getClient() {
    return this.client;
  }

  async callZome(
    zomeName: string,
    fnName: string,
    payload: unknown,
    roleName: string = 'requests_and_offers'
  ) {
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

  decodeOutputs(records: Record[]): unknown[] {
    return records.map((r) => decode((r.entry as any).Present.entry));
  }

  isLoading() {
    return this.loading;
  }
}

const holochainClientService = new HolochainClientService();
export default holochainClientService;
