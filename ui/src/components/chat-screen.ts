
import { LitElement, html, css, CSSResultGroup } from 'lit';
import { state, customElement, property, query } from 'lit/decorators.js';
import { InstalledCell, AppWebsocket, EntryHash, InstalledAppInfo, AgentPubKey, AppSignal } from '@holochain/client';
import { contextProvided } from '@lit-labs/context';
import { appInfoContext, appWebsocketContext, burnerServiceContext } from '../contexts';
import { serializeHash, deserializeHash } from '@holochain-open-dev/utils';
import { AgentPubKeyB64, Message, Username } from '../types/chat';
import { TaskSubscriber } from 'lit-svelte-stores';
import { ChatBubble } from './chat-bubble';
import { BurnerService } from '../burner-service';
import { chatBubbles, randomAvatar } from '../helpers/random-avatars';
import { Drawer } from './menu';

// export interface MemberInfo {
//   agentPubKey: AgentPubKey,
//   username: string,
// }


@customElement('chat-screen')
export class ChatScreen extends LitElement {
  receiveMessage(signalInput: AppSignal) {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super();
  }

  @contextProvided({ context: appWebsocketContext })
  appWebsocket!: AppWebsocket;

  @contextProvided({ context: appInfoContext })
  appInfo!: InstalledAppInfo;

  @contextProvided({ context: burnerServiceContext, subscribe: true })
  @state()
  service!: BurnerService;

  @query("input#current-channel")
  currentChannelInput!: HTMLInputElement;

  channel = new TaskSubscriber(
    this,
    () => this.service.getChannel(),
    () => [this.service]
  );

  username = new TaskSubscriber(
    this,
    () => this.service.getUsername(),
    () => [this.service]
  );

  @property({ type: Object })
  @state()
  channelMembers: Record<AgentPubKeyB64, Username> = {};

  @state()
  chatBubbles: Record<AgentPubKeyB64, ChatBubble> = {};

  @property()
  myAgentPubKey!: string;

  // async signalCallback(signalInput: AppSignal) {
  //   let msg: Message = signalInput.data.payload;
  //   console.log(signalInput);
  //   (window as any).signalInput = signalInput;
  //   // alert(signalInput.data.payload.payload);
  // }

  // setService(service: BurnerService) {
  //   console.log("assigning chat-screen service");
  //   this.service = service;
  //   console.log("this.service");
  //   console.log(this.service);
  // }

  async firstUpdated() {
    // do stuff
    console.log("FIRST UPDATED CHAT_SCREEN");
    console.log("this.service");
    console.log(this.service);
  }

  receiveEmojiCannonSignal(signal: AppSignal) {
    // @TODO: filter by agentPubKey, check if agent exist as chat-bubble
    if (Object.keys(this.channelMembers).includes(signal.data.payload.senderKey)) {
      // propagate signal to the right bubble
    }
  }

  receiveMessageSignal(signal: AppSignal) {
    // @TODO: filter by agentPubKey, check if agent exist as chat-bubble
    let senderPubKey = serializeHash(signal.data.payload.senderKey);
    if (Object.keys(this.channelMembers).includes(senderPubKey)) {
      // propagate signal to the right bubble
      const chatBubble = this.shadowRoot?.getElementById(senderPubKey) as ChatBubble;
      // chatBubble
      chatBubble.recieveSignal(signal);
    }
  }

  receiveBurnSignal(signal: AppSignal) {
    const memberWhoBurns = signal.data.payload.agent;
    // @TODO => ensure that joining member is of type AgentPubKeyB64
    // this.channelMembers = [...this.channelMembers, joiningMember];
  }

  render() {
    // console.log("this.channelMembers");
    // console.log(this.channelMembers);
    console.warn(randomAvatar())
    return html`
    <div class="chat-screen">
      <drawer-menu></drawer-menu>
      <div class="chat-bubblez">
        ${Object.entries(this.channelMembers)
          // .concat(chatBubbles(this.channel.value!) // comment out this and next line to disable demo data
          //   .map(e => [e.agentPubKey, e.username]))
          .filter(([myAgentPubKey, _]) => this.myAgentPubKey !== myAgentPubKey)
          .map(([agentPubKey, username]) => {
          return html`<chat-bubble id=${agentPubKey}
            .username=${username}
            .avatarUrl=${randomAvatar()}
            .agentPubKey=${agentPubKey}
          >${username}</chat-bubble>`
        })}
      </div>
      <div style='display: flex;
        justify-items: center;
        align-items: center;
        flex-direction: column;'>
        <h1>ADMIN CHATBUBBLE</h1>
        <chat-bubble id=${this.myAgentPubKey}
          .username=${this.username.value!}
          .avatarUrl=${randomAvatar()}
          .agentPubKey=${this.myAgentPubKey}
          .isAdmin=${true}
          .channelMembers=${this.channelMembers}
        >${this.username.value!}
        </chat-bubble>
      </div>
    </div>
    `
  }

  static styles = css`
    .chat-screen {
      display: flex;
      flex-direction: column;
    }
    .chat-name {
      margin-bottom: 30px;
    }

    .chat-bubblez {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-evenly;
    }

    /* .chat-bubblez > chat-bubble {
      flex: 1 1 250px;
    } */

  ` as CSSResultGroup;

  static get scopedElements() {
    return {
      "chat-bubble": ChatBubble,
      "drawer-menu": Drawer,
    }
  }
}
