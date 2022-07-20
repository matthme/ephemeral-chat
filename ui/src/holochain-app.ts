import '@webcomponents/scoped-custom-element-registry';

import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import {
  AgentPubKey,
  AppSignal,
  AppWebsocket,
  EntryHash,
  InstalledAppInfo,
  InstalledCell,
} from '@holochain/client';
import { contextProvider } from '@lit-labs/context';
import '@material/mwc-circular-progress';

import { get } from 'svelte/store';
import { appWebsocketContext, appInfoContext, burnerStoreContext } from './contexts';
import { serializeHash, deserializeHash } from '@holochain-open-dev/utils';
import { MessageInput } from './types/chat';
import { ChatScreen } from './components/chat-screen';
import { BurnerStore } from './burner-store';
import { BurnerService } from './burner-service';
import { CellClient, HolochainClient } from '@holochain-open-dev/cell-client';

@customElement('holochain-app')
export class HolochainApp extends LitElement {
  @state() loading = false;
  @state() entryHash: EntryHash | undefined;

  @contextProvider({ context: appWebsocketContext })
  @property({ type: Object })
  appWebsocket!: AppWebsocket;

  @contextProvider({ context: appInfoContext })
  @property({ type: Object })
  appInfo!: InstalledAppInfo;

  @contextProvider({ context: burnerStoreContext })
  @property({ type: Object })
  store!: BurnerStore;


  @query("#test-signal-text-input")
  textInputField!: HTMLInputElement;

  @query("#test-recipient-input")
  recipientInputField!: HTMLInputElement;

  @query("#channel-secret-input")
  channelSecretInputField!: HTMLInputElement;

  @state()
  myAgentPubKey!: String;

  @state()
  channelMembers: string[] = [];

  async dispatchTestSignal() {
    // get the input from the input text field
    const input = this.textInputField.value;
    // copied from boiulerplate
    const cellData = this.appInfo.cell_data.find((c: InstalledCell) => c.role_id === 'burner_chat')!;
    await this.appWebsocket.callZome({
      cap_secret: null,
      cell_id: cellData.cell_id,
      zome_name: 'chat',
      fn_name: 'signal_test',
      payload: input,
      provenance: cellData.cell_id[1]
    });
  }


  async sendRemoteSignal() {
    const msgText = this.textInputField.value;
    const recipient = this.recipientInputField.value;

    const msgInput: MessageInput = {
      payload: msgText,
      senderName: "sender",
      recipients: [deserializeHash(recipient)],
      secret: "secret",
    }

    const cellData = this.appInfo.cell_data.find((c: InstalledCell) => c.role_id === 'burner_chat')!;
    await this.appWebsocket.callZome({
      cap_secret: null,
      cell_id: cellData.cell_id,
      zome_name: 'chat',
      fn_name: 'send_msg',
      payload: msgInput,
      provenance: cellData.cell_id[1]
    });

  }
  //
  async signalCallback(signalInput: AppSignal) {
    console.log(signalInput);
    (window as any).signalInput = signalInput;
    alert(signalInput.data.payload.payload);
  }

  async firstUpdated() {
    this.appWebsocket = await AppWebsocket.connect(
      `ws://localhost:${process.env.HC_PORT}`,
      undefined, // timeout
      this.signalCallback,
    );

    this.appInfo = await this.appWebsocket.appInfo({
      installed_app_id: 'burner-chat',
    });

    const cellData = this.appInfo.cell_data.find((c: InstalledCell) => c.role_id === 'burner_chat')!;
    this.myAgentPubKey = serializeHash(cellData.cell_id[1]);

    const cell = this.appInfo.cell_data.find(c => c.role_id === 'burner_chat');
    const client = new HolochainClient(this.appWebsocket);
    const cellClient = new CellClient(client, cell!);

    this.store = new BurnerStore(new BurnerService(cellClient));

    this.loading = false;
  }

  async joinChannel(): Promise<void> {
    const secret = this.channelSecretInputField.value;
    await this.store.joinChannel(secret);
    const channelMembers = await this.store.fetchChannelMembers(secret);
    const channelMembersB64 = get(channelMembers).map(pubkey => serializeHash(pubkey));
    this.channelMembers = channelMembersB64;
  }

  render() {
    if (this.loading)
      return html`
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      `;

    console.log("CHANNEL MEMBERS: ", this.channelMembers);

    return html`
      <main>
        <h1 class="main-title">🔥 BURNER CHAT</h1>
        <chat-screen channel="my-random-channel"></chat-screen>
        <input id="test-signal-text-input" type="text" placeholder="your message..." />
        <input id="test-recipient-input" type="text" placeholder="recipient pubkey"/>
        <div>My key: ${this.myAgentPubKey}</div>
        <div>
          <input id="channel-secret-input" type="text" placeholder="Channel secret"/>
          <button @click=${this.joinChannel}>Join Channel</button>
        </div>
        <div>MEMBERS:
        ${
          this.channelMembers.forEach((member) => {
            return html`<div>${member}</div>`
          })
        }
        </div>
        <button class="bttn-test-signal"
          @click=${this.sendRemoteSignal}>
           Send Remote Signal
        </button><br>
        <br>
        <button class="bttn-test-signal"
          @click=${this.dispatchTestSignal}>
            Signal Test
        </button>
        <create-entry-def-0 @entry-def-0-created=${(e: CustomEvent) => this.entryHash = e.detail.entryHash}></create-entry-def-0>
    ${this.entryHash ? html`
      <entry-def-0-detail .entryHash=${this.entryHash}></entry-def-0-detail>
    ` : html``}
      </main>
    `;
  }

  static styles = css`
    :host {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      font-size: calc(10px + 2vmin);
      color: #1a2b42;
      max-width: 960px;
      margin: 0 auto;
      text-align: center;
      background-color: var(--lit-element-background-color);
    }

    main {
      flex-grow: 1;
    }

    .app-footer {
      font-size: calc(12px + 0.5vmin);
      align-items: center;
    }

    .app-footer a {
      margin-left: 5px;
    }

    .main-title {
      font-family: 'Rubik', monospace;
      font-weight: bold;
      letter-spacing: 4px;
      color: #6737FF;
    }
  `;

  static get scopedElements() {
    return {
      "chat-screen": ChatScreen,
    }
  }
}


/**
LOADED FONTS, use like this
font-family: 'Roboto Mono', monospace;
font-family: 'Rubik', sans-serif;
 */