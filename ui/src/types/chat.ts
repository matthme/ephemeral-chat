import { AgentPubKey } from '@holochain/client';


export interface Message {
  signalType: string,
  payload: string,
  timestamp: number,
  senderKey: AgentPubKey,
  senderName: string,
  secret: string,
}

export interface MessageInput {
  signalType: string,
  payload: string,
  senderName: string,
  recipients: AgentPubKey[],
  channel: string,
}


export interface ChannelMessage {
  signalType: string,
  agent: AgentPubKey,
  channel: string,
  username: string,
}


export interface ChannelMessageInput {
  signalType: string,
  channel: string,
  username: string,
}


export type Username = string;
export type AgentPubKeyB64 = string;