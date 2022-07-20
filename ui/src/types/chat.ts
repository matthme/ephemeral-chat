import { AgentPubKey } from '@holochain/client';


export interface Message {
  payload: string,
  timestamp: number,
  senderKey: AgentPubKey,
  senderName: string,
  secret: string,
}


export interface MessageInput {
  payload: string,
  senderName: string,
  recipients: AgentPubKey[],
  secret: string,
}

