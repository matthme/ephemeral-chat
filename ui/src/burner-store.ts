// import { HoloHashMap } from '@holochain-open-dev/utils';
// import { AgentPubKey } from '@holochain/client';
// import { writable, Writable, derived, Readable, get } from 'svelte/store';
// import { decode } from '@msgpack/msgpack';

// import { BurnerService } from './burner-service';


// type Secret = string;
// export class BurnerStore {
//   /** Private */
//   private _myChannels: Writable<Record<Secret, AgentPubKey[]>> = writable({});
//   private _currentChannel: Writable<string> = writable();


//   /** Static info */
//   public myAgentPubKey: AgentPubKey;
//   public myUsername: String | undefined;

//   constructor(
//     protected service: BurnerService,
//   ) {
//     this.myAgentPubKey = service.cellClient.cell.cell_id[1];
//     this.myUsername = undefined;
//   }

//   /** Actions */
//   async joinChannel(secret: string): Promise<void> {
//     const _actionHash = await this.service.joinChannel(secret);
//     const alreadyMembers = await this.service.getChannelMembers(secret);
//     this._myChannels.update(channels => {
//       if (!channels[secret]) {
//         channels[secret] = alreadyMembers;
//       }
//       return channels;
//     });

//     this.selectChannel(secret);
//   }


//   selectChannel(secret: string): void {
//     this._currentChannel.set(secret);
//   }



//   /**
//    * Fetches members of a channel
//    *
//    *
//    */
//   async fetchChannelMembers(secret: string): Promise<Readable<AgentPubKey[]>> {
//     const channelMembers = await this.service.getChannelMembers(secret);

//     this._myChannels.update(channels => {
//       channels[secret] = channelMembers;
//       return channels;
//     });

//     return derived(this._myChannels, channels => channels[secret]);
//   }

//   // getMyChannels(): Promise<Readable<string[]> {
//   //   //
//   // }


//   async burnChannel() {
//     await this.service.burnChannel(get(this._currentChannel));
//   }

// }
