
import { LitElement, html, css, CSSResultGroup } from 'lit';
import { state, customElement, property, query } from 'lit/decorators.js';
import { InstalledCell, AppWebsocket, EntryHash, InstalledAppInfo, AgentPubKey, AppSignal } from '@holochain/client';
import { contextProvided } from '@lit-labs/context';
import { appInfoContext, appWebsocketContext, burnerServiceContext } from '../contexts';
import { serializeHash, deserializeHash } from '@holochain-open-dev/utils';
import { AgentPubKeyB64, ChannelMessageInput, Message, Username } from '../types/chat';
import { TaskSubscriber } from 'lit-svelte-stores';
import { ChatBubble } from './chat-bubble';
import { BurnerService } from '../burner-service';
import { chatBubbles, randomAvatar } from '../helpers/random-avatars';
import { Drawer } from './menu';
import JSConfetti from 'js-confetti';

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

  @state()
  isBURNT: boolean = false;

  @state()
  memberWhoBurns: string = "";

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
  
  async burnChannel() {
    const jsConfetti = new JSConfetti()
    jsConfetti.addConfetti({
      emojis: ['🔥', '💥', '🔥', '🔥'],
    })
    setTimeout(() => {
      const msgInput: ChannelMessageInput = {
        signalType: "BurnChannel",
        channel: this.channel.value!,
        username: this.username.value!,
      };
      this.service.burnChannel(msgInput);
    }, 500);
  }


  async receiveBurnSignal(signal: AppSignal) {
    this.memberWhoBurns = signal.data.payload.username;
    this.isBURNT = true;

    // @TODO => ensure that joining member is of type AgentPubKeyB64
    // this.channelMembers = [...this.channelMembers, joiningMember];
  }

  renderBurnScreen() {
    return html`
      <div class="burnt-text-container" style="display: flex: flex-direction: column: align-items: center">
        <p class="new-burned-text">🔥🔥🔥 ${this.memberWhoBurns} buuuuuuurrnt the channel !</p>
        <!-- <div style="margin-top: 60px; margin-bottom: 30px;"><strong>${this.memberWhoBurns}</strong></div>
        <div style="margin-bottom: 60px;">just <strong>🔥 BURRRRNNT 🔥</strong> the channel :-(</div> -->
      </div>
      <div style="display: flex; flex-direction: column; align-items: center;">
        <button id="go-home" 
          @click=${() => { 
            this.service.setChannel(undefined); 
            this.isBURNT = false;}}>Go Home
        </button>
        <button id="play-alone" @click=${() => { 
            const jsConfetti = new JSConfetti()
            jsConfetti.addConfetti({
              emojis: ['🌈', '⚡️', '💥', '✨', '💫', '🌸', '🦄', '🔥'],
            })
          }
        }
        >Party Alone</button>
      </div>
    `
  }


  render() {
    if (this.isBURNT) {
      return html`
        ${this.renderBurnScreen()}
      `
    }

    return html`
    <div class="chat-screen">
      <!-- <drawer-menu></drawer-menu> -->
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
      <div class="bottom-chat-container">
        <div class="admin-chat-cointainer">
          <div style='display: flex;
            justify-items: center;
            align-items: center;
            flex-direction: column;'>
            <chat-bubble id=${this.myAgentPubKey}
              .username=${this.username.value!}
              .avatarUrl=${randomAvatar()}
              .agentPubKey=${this.myAgentPubKey}
              .isAdmin=${true}
              .channelMembers=${this.channelMembers}
            >${this.username.value!}
            </chat-bubble>
          </div>
          <button id="burn-btn" @click=${() => this.burnChannel()}>🔥</button>
        </div>

      </div>
    </div>
    `
  }

  static styles = css`
    .burnt-text-container {
      max-width: 500px;
      font-family: Roboto Mono;
      font-size: 35px; 
      margin: 0 auto;
    }
    p.new-burned-text {
      margin-top: 100px;
      margin-bottom: 50px;
    }
    #burn-btn {
      all: unset;
      border-radius: 30px;
      background-color: rgb(46, 53, 76);
      max-width: 50%;
      margin: auto;
      padding: 10px 30px;
      font-weight: bold;
      color: rgb(245, 245, 245);
      position: absolute;
      padding: 5px;
      right: 140px;
      bottom: 16px;
      cursor: pointer;
    }
    .admin-chat-cointainer {
      max-width: 360px;
      margin: 0 auto;
      position: relative;
    }

    .bottom-chat-container {
      position:fixed;
      bottom: 0;
      width: 100%;
      /* background-color: green; */
      height: 228px;
    }

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

    button#go-home {
      all: unset;
      margin: 10px;
      padding: 10px 20px;
      color: red;
      background-color: #313a58;
      color: #FBFAF8;
      cursor: pointer;
      width: 300px;
      border-radius: 100px;
      font-weight: bold;
      font-family: 'Rubik';
      padding: 14px 20px;
    }

    button#party {
      all: unset;
      margin: 10px;
      padding: 10px 20px;
      color: red;
      background-color: #2E354C;
      color: #FBFAF8;
      cursor: pointer;
      width: 300px;
      border-radius: 100px;
      font-weight: bold;
      font-family: 'Rubik';
    }

    button#play-alone {
      all: unset;
      margin: 10px;
      padding: 10px 20px;
      color: red;
      background-color: #2E354C;
      color: #FBFAF8;
      cursor: pointer;
      width: 300px;
      border-radius: 100px;
      font-weight: bold;
      font-family: 'Rubik';
      background: #17e6b73b;
      color: black;
      padding: 14px 20px;
    }

    input.join-channel {
      all: unset;
      background-color: white;
      margin: 10px;
      padding: 10px 20px;
      box-shadow: 0 0 10px rgb(0 0 0 / 10%);
      border-radius: 100px;
      width: 300px;
    }
    input.join-channel::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
      color: #ADADAD;
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
