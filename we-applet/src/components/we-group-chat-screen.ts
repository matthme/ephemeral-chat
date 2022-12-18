
import { LitElement, html, css, CSSResultGroup } from 'lit';
import { state, customElement, property, query } from 'lit/decorators.js';
import { InstalledCell, AppWebsocket, EntryHash, AppInfo, AgentPubKey, AppSignal } from '@holochain/client';
import { contextProvided } from '@lit-labs/context';
import {
  appInfoContext,
  appWebsocketContext,
  burnerServiceContext,
  BurnerService,
  chatBubbles,
  randomAvatar ,
  Drawer,
  AgentPubKeyB64,
  ChannelMessageInput,
  Message,
  Username
} from '@burner-chat/elements';
import { ChatBubble } from '@burner-chat/elements';
import { serializeHash, deserializeHash } from '@holochain-open-dev/utils';
import { TaskSubscriber } from 'lit-svelte-stores';
import JSConfetti from 'js-confetti';
import { Profile, ProfilesStore, profilesStoreContext } from '@holochain-open-dev/profiles';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';

// export interface MemberInfo {
//   agentPubKey: AgentPubKey,
//   username: string,
// }

export class WeGroupChatScreen extends ScopedElementsMixin(LitElement) {
  receiveMessage(signalInput: AppSignal) {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super();
  }

  @contextProvided({ context: appWebsocketContext })
  appWebsocket!: AppWebsocket;

  @contextProvided({ context: appInfoContext })
  appInfo!: AppInfo;

  @contextProvided({ context: burnerServiceContext, subscribe: true })
  @state()
  service!: BurnerService;

  @contextProvided({ context: profilesStoreContext, subscribe: true })
  profilesStore!: ProfilesStore;

  @query("input#current-channel")
  currentChannelInput!: HTMLInputElement;

  channel = new TaskSubscriber(
    this,
    () => this.service.getChannel(),
    () => [this.service]
  );

  weGroupMembers = new TaskSubscriber(
    this,
    () => this.profilesStore.fetchAllProfiles(),
    () => [this.profilesStore]
  );

  _myProfile = new TaskSubscriber(
    this,
    () => this.profilesStore.fetchMyProfile(),
    () => [this.profilesStore]
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
  //   (window as any).signalInput = signalInput;
  //   // alert(signalInput.data.payload.payload);
  // }

  // setService(service: BurnerService) {
  //   this.service = service;
  // }

  avatarOfAgent(agentPubKey: AgentPubKeyB64) {
    return this.weGroupMembers.value?.get(deserializeHash(agentPubKey)).fields.avatar
  }

  async firstUpdated() {
    // do stuff
  }

  receiveEmojiCannonSignal(signal: AppSignal) {
    // filter by agentPubKey, check if agent exist as chat-bubble
    let senderPubKey = serializeHash(signal.data.payload.senderKey);
    if (Object.keys(this.channelMembers).includes(senderPubKey)) {
      // propagate signal to the right bubble
      const chatBubble = this.shadowRoot?.getElementById(senderPubKey) as ChatBubble;
      chatBubble.causedEmojiCannon();
      // extract emoji from payload and go confetti
      const emoji = signal.data.payload.payload;
      const jsConfetti = new JSConfetti()
      jsConfetti.addConfetti({
        emojis: [emoji],
      })
    }
  }

  receiveMessageSignal(signal: AppSignal) {
    // filter by agentPubKey, check if agent exist as chat-bubble
    let senderPubKey = serializeHash(signal.data.payload.senderKey);
    if (Object.keys(this.channelMembers).includes(senderPubKey)) {
      // propagate signal to the right bubble
      const chatBubble = this.shadowRoot?.getElementById(senderPubKey) as ChatBubble;
      // chatBubble
      chatBubble.receiveSignal(signal);
    }
  }

  async burnChannel(profile: Profile) {
    const jsConfetti = new JSConfetti()
    jsConfetti.addConfetti({
      emojis: ['🔥', '💥', '🔥', '🔥'],
    })
    setTimeout(() => {
      const msgInput: ChannelMessageInput = {
        signalType: "BurnChannel",
        channel: this.channel.value!,
        username: profile!.nickname,
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
    return this._myProfile.render({
      pending: () => html`
        <div class="row center-content" style="flex: 1;">
          <mwc-circular-progress indeterminate></mwc-circular-progress>
        </div>
      `,
      complete: (myProfile) => {
        if (this.isBURNT) {
          return html`
            ${this.renderBurnScreen()}
          `
        }


        const myAvatar = myProfile!.fields.avatar ? myProfile!.fields.avatar : randomAvatar();
        const myNickname = myProfile!.nickname;


        return html`
        <div class="chat-screen">
          <!-- <drawer-menu></drawer-menu> -->
          <div class="chat-bubblez">
            ${Object.entries(this.channelMembers)
              // .concat(chatBubbles(this.channel.value!) // comment out this and next line to disable demo data
              //   .map(e => [e.agentPubKey, e.username]))
              .filter(([myAgentPubKey, _]) => this.myAgentPubKey !== myAgentPubKey)
              .map(([agentPubKey, username]) => {
                const avatar = this.avatarOfAgent(agentPubKey);
              return html`<chat-bubble id=${agentPubKey}
                .username=${username}
                .avatarUrl=${avatar ? avatar : randomAvatar()}
                .agentPubKey=${agentPubKey}
              ></chat-bubble>`
            })}
          </div>
          <div class="bottom-chat-container">
            <div class="admin-chat-cointainer">
              <div style='display: flex;
                flex-direction: column;
                flex: 1;'>
                <chat-bubble
                  style="display: flex; flex: 1;"
                  id=${this.myAgentPubKey}
                  .username=${myNickname}
                  .avatarUrl=${myAvatar}
                  .agentPubKey=${this.myAgentPubKey}
                  .isAdmin=${true}
                  .channelMembers=${this.channelMembers}
                ></chat-bubble>
              </div>
            </div>
          </div>
          <button id="burn-btn" @click=${() => this.burnChannel(myProfile!)}>🔥</button>
        </div>
        `
      }
    });
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
      position: fixed;
      padding: 5px;
      right: 77px;
      bottom: 44px;
      cursor: pointer;
    }
    .admin-chat-cointainer {
      display: flex;
      flex: 1;
      max-width: 360px;
      margin: 0 auto;
      position: relative;
    }

    .bottom-chat-container {
      display: flex;
      flex: 1;
      position:fixed;
      bottom: 0;
      width: 100%;
      /* background-color: green; */
      height: 228px;
    }

    .chat-screen {
      display: flex;
      flex: 1;
      flex-direction: column;
    }
    .chat-name {
      margin-bottom: 30px;
    }

    .chat-bubblez {
      width: 100%;
      display: flex;
      flex: 1;
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
