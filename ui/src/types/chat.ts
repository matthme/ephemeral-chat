import { AgentPubKey } from '@holochain/client';


export interface Message {
  payload: string,
  timestamp: number,
  sender_key: AgentPubKey,
  senderName: string,
  secret: string,
}


export interface MessageInput {
  payload: string,
  senderName: string,
  recipients: AgentPubKey[],
  secret: string,
}