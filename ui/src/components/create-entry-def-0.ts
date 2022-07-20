
// import { LitElement, html } from 'lit';
// import { state, customElement } from 'lit/decorators.js';
// import { InstalledCell, AppWebsocket, InstalledAppInfo } from '@holochain/client';
// import { contextProvided } from '@lit-labs/context';
// import { appWebsocketContext, appInfoContext } from '../../../contexts';
// import { EntryDef0 } from '../../../types/chat';
// import '@material/mwc-button';
// import '@type-craft/title/create-title';
// import '@type-craft/content/create-content';
// import { decode } from "@msgpack/msgpack"; // decode takes bytearray and decodes into js obj
// import { serializeHash, deserializeHash } from '@holochain-open-dev/utils'; // basic endocing / decoding

// @customElement('create-entry-def-0')
// export class CreateEntryDef0 extends LitElement {

//     @state()
//   _title: string | undefined;

//   @state()
//   _content: string | undefined;

//   isEntryDef0Valid() {
//     return this._title &&
//       this._content;
//   }

//   @contextProvided({ context: appWebsocketContext })
//   appWebsocket!: AppWebsocket;

//   @contextProvided({ context: appInfoContext })
//   appInfo!: InstalledAppInfo;

//   async createEntryDef0() {
//     const cellData = this.appInfo.cell_data.find((c: InstalledCell) => c.role_id === 'ephemeral_chat')!;

//     const entryDef0: EntryDef0 = {
//       title: this._title!,
//         content: this._content!,
//     };

//     await this.appWebsocket.callZome({
//       cap_secret: null,
//       cell_id: cellData.cell_id,
//       zome_name: 'chat',
//       fn_name: 'signal_test',
//       payload: null,
//       provenance: cellData.cell_id[1]
//     });

//     // this.dispatchEvent(new CustomEvent('entry-def-0-created', {
//     //   composed: true,
//     //   bubbles: true,
//     //   detail: {
//     //     entryHash
//     //   }
//     // }));
//   }

//   render() {
//     return html`
//       <div style="display: flex; flex-direction: column">
//         <span style="font-size: 18px">Create EntryDef0</span>

//         <create-title

//       @change=${(e: Event) => this._title = (e.target as any).value}
//       style="margin-top: 16px"
//     ></create-title>

//         <create-content

//       @change=${(e: Event) => this._content = (e.target as any).value}
//       style="margin-top: 16px"
//     ></create-content>

//         <mwc-button
//           label="Create EntryDef0"
//           .disabled=${!this.isEntryDef0Valid()}
//           @click=${() => this.createEntryDef0()}
//         ></mwc-button>
//     </div>`;
//   }
// }
