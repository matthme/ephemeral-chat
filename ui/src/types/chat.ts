import { AgentPubKey } from '@holochain/client';


export interface Message {
  signalType: string,
  payload: string,
  timestamp: number,
  senderKey: AgentPubKey,
  senderName: string,
  secret: string,
}


export interface JoinChannelMessage {
  signalType: string,
  agent: AgentPubKey,
}

export interface BurnChannelMessage {
  signalType: string,
  agent: AgentPubKey,
}

export interface MessageInput {
  signalType: string,
  payload: string,
  senderName: string,
  recipients: AgentPubKey[],
  secret: string,
}

