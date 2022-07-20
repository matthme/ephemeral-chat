// import { CellClient } from '@holochain-open-dev/cell-client';
// import { ActionHash, AgentPubKey } from '@holochain/client';
// import { MessageInput } from './types/chat';

// export class BurnerService {
//   constructor(public cellClient: CellClient, public zomeName = 'chat') {}

//   /**
//    * Get the members of a group
//    * @param secret a secret string defining the shared group
//    * @returns array of AgentPubKeys
//    */
//   async getGroupMembers(secret: string): Promise<AgentPubKey[]> {
//     return this.callZome('get_group_members', secret);
//   }

//   /**
//    * Join a group. Creates one if it doesn't exist yet.
//    *
//    * @param secret a secret string defining the shared group
//    * @returns action hash of the create_link action
//    */
//   async joinGroup(secret: string): Promise<ActionHash> {
//     return this.callZome('join_group', secret);
//   }

//   /**
//    * Send message
//    *
//    * @param agentPubKeys the agents to get the profile for
//    * @returns the profile of the agents, in the same order as the input parameters
//    */
//   async sendMsg(msg_input: MessageInput): Promise<void> {
//     return this.callZome('send_msg', msg_input);
//   }


//   private callZome(fn_name: string, payload: any) {
//     return this.cellClient.callZome(this.zomeName, fn_name, payload);
//   }
// }
