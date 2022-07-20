
// import { LitElement, html } from 'lit';
// import { state, customElement, property } from 'lit/decorators.js';
// import { InstalledCell, AppWebsocket, EntryHash, InstalledAppInfo } from '@holochain/client';
// import { contextProvided } from '@lit-labs/context';
// import { appInfoContext, appWebsocketContext } from '../../../contexts';
// import '@material/mwc-circular-progress';
// import '@type-craft/title/title-detail';
// import '@type-craft/content/content-detail';

// @customElement('entry-def-0-detail')
// export class EntryDef0Detail extends LitElement {
//   @property()
//   entryHash!: EntryHash;

//   @state()
//   _entryDef0: EntryDef0 | undefined;

//   @contextProvided({ context: appWebsocketContext })
//   appWebsocket!: AppWebsocket;

//   @contextProvided({ context: appInfoContext })
//   appInfo!: InstalledAppInfo;

//   async firstUpdated() {
//     const cellData = this.appInfo.cell_data.find((c: InstalledCell) => c.role_id === 'ephemeral_chat')!;

//     this._entryDef0 = await this.appWebsocket.callZome({
//       cap_secret: null,
//       cell_id: cellData.cell_id,
//       zome_name: 'chat',
//       fn_name: 'get_entry_def_0',
//       payload: this.entryHash,
//       provenance: cellData.cell_id[1]
//     });
//   }

//   render() {
//     if (!this._entryDef0) {
//       return html`<div style="display: flex; flex: 1; align-items: center; justify-content: center">
//         <mwc-circular-progress indeterminate></mwc-circular-progress>
//       </div>`;
//     }

//     return html`
//       <div style="display: flex; flex-direction: column">
//         <span style="font-size: 18px">EntryDef0</span>


//     <title-detail

//     .value=${this._entryDef0.title}
//       style="margin-top: 16px"
//     ></title-detail>


//     <content-detail

//     .value=${this._entryDef0.content}
//       style="margin-top: 16px"
//     ></content-detail>

//       </div>
//     `;
//   }
// }
