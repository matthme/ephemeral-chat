
import { LitElement, css, html, CSSResultGroup } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import { InstalledCell, AppWebsocket, EntryHash, InstalledAppInfo, AgentPubKey, AppSignal } from '@holochain/client';
import { contextProvided } from '@lit-labs/context';
import { appInfoContext, appWebsocketContext } from '../contexts';
import { serializeHash, deserializeHash } from '@holochain-open-dev/utils';
import { Message } from '../types/chat';
import JSConfetti from 'js-confetti';
// import logo from '../components/images/bubble-big.png';

interface ChatBufferElement {
  timestamp: number,
  payload: string,
}

@customElement('chat-bubble')
export class ChatBubble extends LitElement {

  @contextProvided({ context: appWebsocketContext })
  appWebsocket!: AppWebsocket;

  @contextProvided({ context: appInfoContext })
  appInfo!: InstalledAppInfo;

  @property()
  channel!: string;

  @property()
  showEmoji: boolean = true;

  @state()
  chatBuffer!: ChatBufferElement[];

  @state()
  emojis: string[] = ['🌈', '⚡️', '💥', '✨', '💫', '🌸'];

  @property()
  username!: string;

  @property()
  avatarUrl!: string;

  @property()
  agentPubKey!: string;


  addToBuffer(msg: Message) {
    let chatBufferElement = {
      timestamp: msg.timestamp,
      payload: msg.payload
    };
    // let newBuffer = this.chatBuffer.concat(chatBufferElement);
    this.chatBuffer = [...this.chatBuffer, chatBufferElement];
    this.printBuffer();
  }

  updateBuffer() {

  }

  sortBuffer() {
    let sortedBuffer = this.chatBuffer.sort((a,b) => {
      return b.timestamp - a.timestamp;
    });
    this.chatBuffer = sortedBuffer;
  }

  bufferToString() {
    return this.chatBuffer.map(chatBufferObj => {
      return chatBufferObj.payload;
    }).join("");
  }

  printBuffer() {
    console.log(this.bufferToString());
  }

  _handleClick(emoji: string) {
    const jsConfetti = new JSConfetti()
    jsConfetti.addConfetti({
      emojis: [emoji],
   })
  }

  async signalCallback(signalInput: AppSignal) {

    let msg: Message = signalInput.data.payload;

    const sameAgent = serializeHash(msg.senderKey) == this.agentPubKey;
    const sameChannel = this.channel == msg.secret;
    if (sameAgent && sameChannel) {
      this.addToBuffer(msg);
      console.log(this.bufferToString());
    }

    console.log(signalInput);
    (window as any).signalInput = signalInput;
    // alert(signalInput.data.payload.payload);
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

  }

  renderEmoji(emoji: string, i: number) {
    return html`
    <!-- ${i === 3 ? html`<br>` : ''} -->
    <button @click="${() => this._handleClick(emoji)}" class="emoji-btn">
        ${emoji}
    </button>`
  }

  render() {
    return html`
      <div class="chat-bubble">
        
        <p>${this.channel} ${this.username}</p>
        
        <div class="chat-quote">
          <textarea placeholder="Input your text" rows="2" wrap="hard" maxlength="50"></textarea>
        </div>
        
        <!-- <p class="chat-area"></p> -->
        <div class="chat-buttons">
          <div class="emoji-container">
            ${this.emojis.map((e, i) => this.renderEmoji(e, i))}
          </div>
          <div class="avatar-container">
            <img src=${this.avatarUrl} width="50" height="50" class="avatar"/>
          </div>
        </div>
        
        <button @click="${this._handleClick}">Burnz</button>
        
      </div>
    `
    // if (!this._entryDef0) {
    //   return html`<div style="display: flex; flex: 1; align-items: center; justify-content: center">
    //     <mwc-circular-progress indeterminate></mwc-circular-progress>
    //   </div>`;
    // }

    // return html`
    //   <div style="display: flex; flex-direction: column">
    //     <span style="font-size: 18px">EntryDef0</span>


    // <title-detail

    // .value=${this._entryDef0.title}
    //   style="margin-top: 16px"
    // ></title-detail>


    // <content-detail

    // .value=${this._entryDef0.content}
    //   style="margin-top: 16px"
    // ></content-detail>

    //   </div>
    // `;

    
  }

  // static styles = css`
  //   .chat-bubble {
  //     background-color: 'red';
  //   }
  //   ` 

  static styles = css`
  /* button { */
    // all: unset;
  /* } */
  .chat-bubble {
    background-color: white;
    border: 1px solid gray;
    padding: 8px;
  }

  .chat-quote {
    display: flex;
    background-image: url(public/bubble-big.png);
    background-size: contain;
    height: 140px;
    background-repeat: no-repeat;
    width: 100%;
  }

  .chat-quote > textarea {
    all: unset;
    /* width: 80%; */
    align-self: flex-start;
    margin-top: 10px;
    margin-left: 10px;
    margin-right: 10px;
    max-height: 3rem;
  }

  .chat-buttons {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  
  .avatar-container {
    display: flex;
  }

  .emoji-container {
    display: flex;
    flex-wrap: wrap;
    /* flex: 1; */
    /* width: 80%; */
  }
  
  img.avatar {
    border-radius: 50%;
    background-color: blue;
  }

  .emoji-btn {
    background-color: rgba(65, 29, 29, 1);
    border: 1px solid rgba(65, 29, 29, 1);
    border-radius: 9px;
    margin: 4px;
    padding: 10px;
  }
` as CSSResultGroup;

}
