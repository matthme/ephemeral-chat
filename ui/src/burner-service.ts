import { CellClient, HolochainClient } from '@holochain-open-dev/cell-client';
import { ActionHash, AgentPubKey, AppWebsocket, CellId, InstalledAppInfo } from '@holochain/client';
import { AgentPubKeyB64, ChannelMessageInput, MessageInput, Username } from './types/chat';
import { writable, Writable, derived, Readable, get } from 'svelte/store';
import { serializeHash } from '@holochain-open-dev/utils';
import { state } from 'lit/decorators.js';

export class BurnerService {

  private _channel: Writable<string | undefined> = writable();
  private _username: Writable<string | undefined> = writable();
  // private _bubbles: Writable<Record<AgentPubKeyB64, ChatBubble>> = writable({});

  myAgentPubKey: AgentPubKeyB64;

  public cellClient: CellClient;
  private cellId: CellId;

  constructor(protected appWebsocket: AppWebsocket, protected appInfo: InstalledAppInfo, protected zomeName = 'chat') {

    const cell = appInfo.cell_data.find(c => c.role_name === 'burner_chat');
    const cellId = cell!.cell_id;

    this.myAgentPubKey = serializeHash(cellId[1]);

    const client = new HolochainClient(appWebsocket);
    this.cellClient = new CellClient(client, cell!);

    this.cellId = cellId;
  }


  async getChannel(): Promise<Readable<string | undefined>> {
    return derived(this._channel, c => c);
  }

  setChannel(channel: string | undefined): void {
    this._channel.update(c => channel);
  }

  async getUsername(): Promise<Readable<string | undefined>> {
    return derived(this._username, c => c);
  }

  setUsername(username: string | undefined): void {
    this._username.update(u => username);
  }


  /**
   * Get the members of a channel
   * @param secret a secret string defining the shared channel
   * @returns array of AgentPubKeys
   */
  async getChannelMembers(secret: string): Promise<[AgentPubKey, Username][]> {
    const channelMembers = await this.callZome('get_channel_members', secret);
    return channelMembers;
  }

  /**
   * Join a channel. Creates one if it doesn't exist yet.
   *
   * @param secret a secret string defining the shared channel
   * @returns action hash of the create_link action
   */
  async joinChannel(input: ChannelMessageInput): Promise<ActionHash> {
    return this.callZome('join_channel', input);
  }

  /**
   * Send message
   *
   * @param agentPubKeys the agents to get the profile for
   * @returns the profile of the agents, in the same order as the input parameters
   */
  async sendMsg(msg_input: MessageInput): Promise<void> {
    return this.callZome('send_msg', msg_input);
  }


  /**
   * Burn channel
   *
   * @param secret a secret string defining the shared channel
   * @returns void
   */
  async burnChannel(input: ChannelMessageInput): Promise<void> {
    return this.callZome('burn_channel', input);
  }



  private callZome(fn_name: string, payload: any) {
    return this.appWebsocket.callZome({
      cap_secret: null as any,
      cell_id: this.cellId,
      zome_name: this.zomeName,
      fn_name,
      payload,
      provenance: this.cellId[1]
    });
  }
}
