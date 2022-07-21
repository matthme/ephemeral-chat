import { CellClient } from '@holochain-open-dev/cell-client';
import { ActionHash, AgentPubKey } from '@holochain/client';
import { ChannelMessageInput, MessageInput, Username } from './types/chat';

export class BurnerService {
  constructor(public cellClient: CellClient, public zomeName = 'chat') {}

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
    return this.cellClient.callZome(this.zomeName, fn_name, payload);
  }
}
