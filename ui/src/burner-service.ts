import { CellClient } from '@holochain-open-dev/cell-client';
import { ActionHash, AgentPubKey } from '@holochain/client';
import { MessageInput } from './types/chat';

export class BurnerService {
  constructor(public cellClient: CellClient, public zomeName = 'chat') {}

  /**
   * Get the members of a channel
   * @param secret a secret string defining the shared channel
   * @returns array of AgentPubKeys
   */
  async getChannelMembers(secret: string): Promise<AgentPubKey[]> {
    const channelMembers = await this.callZome('get_channel_members', secret);
    // console.log("channelMembersWithDuplicates: ", channelMembersWithDuplicates);
    // const channelMembers =  channelMembersWithDuplicates.filter((c: AgentPubKey, index: number, self: AgentPubKey[]) => {
    //   return self.indexOf(c) === index;
    // });
    // console.log("channelMembers: ", channelMembers);
    return channelMembers;
  }

  /**
   * Join a channel. Creates one if it doesn't exist yet.
   *
   * @param secret a secret string defining the shared channel
   * @returns action hash of the create_link action
   */
  async joinChannel(secret: string): Promise<ActionHash> {
    return this.callZome('join_channel', secret);
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


  private callZome(fn_name: string, payload: any) {
    return this.cellClient.callZome(this.zomeName, fn_name, payload);
  }
}
