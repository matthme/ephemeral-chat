
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
  }

  receiveMessageSignal(signal: AppSignal) {
    // @TODO: filter by agentPubKey, check if agent exist as chat-bubble
  }

  receiveJoinSignal(signal: AppSignal) {
    const joiningMember = signal.data.payload.agent;
    // @TODO => ensure that joining member is of type AgentPubKeyB64
    // this.channelMembers = [...this.channelMembers, joiningMember];
  }

  receiveBurnSignal(signal: AppSignal) {
    const memberWhoBurns = signal.data.payload.agent;
    // @TODO => ensure that joining member is of type AgentPubKeyB64
    // this.channelMembers = [...this.channelMembers, joiningMember];
  }
  submitChannelChange(ev: SubmitEvent) {
    ev.preventDefault();
    const newChannel = this.currentChannelInput.value;
    console.log("requesting channel change to " + newChannel);
    // this.channel = newChannel;
    this.dispatchEvent(
      new CustomEvent("switchChannel", {
        detail: newChannel,
        bubbles: true,
        composed: true,
      })
    );
  }


  renderChannelSelector() {
    return html`
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div>Current Channel</div>
        <form @submit=${this.submitChannelChange}>
          <input id="current-channel" .value=${this.channel.value!} style="all: unset; border-bottom: 2px solid black;"/>
        </form>
      </div>
    `
  }

  render() {
    console.log("this.channelMembers");
    console.log(this.channelMembers);
    console.warn(randomAvatar())
    return html`
    <div class="chat-screen">
      <div class="chat-name">
        ${this.renderChannelSelector()}
      </div>

        <div class="chat-bubblez">
          ${Object.entries(this.channelMembers)
            .concat(chatBubbles(this.channel as string) // comment out this and next line to disable demo data
              .map(e => [e.agentPubKey, e.username]))
            .map(([agentPubKey, username]) => {
            return html`<chat-bubble
              .channel=${this.channel.value}
              .username=${username}
              .avatarUrl=${randomAvatar()}
              .agentPubKey=${agentPubKey}
            >${username}</chat-bubble>`
          })}
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
    }
  }
}
