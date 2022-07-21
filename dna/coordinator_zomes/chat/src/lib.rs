
use std::fmt::Debug;

use hdk::prelude::*;
use chat_integrity::*;




#[derive(Serialize, SerializedBytes, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ChannelMessage {
  signal_type: String,
  agent: AgentPubKey,
  channel: String,
  username: String,
}

#[derive(Serialize, SerializedBytes, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ChannelMessageInput {
  signal_type: String,
  channel: String,
  username: String,
}


#[derive(Serialize, SerializedBytes, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Message {
  signal_type: String,
  payload: String,
  timestamp: Timestamp,
  sender_key: AgentPubKey,
  sender_name: String,
  channel: String,
}



#[allow(dead_code)]
impl Message {
  fn encode(&self) -> String {
    format!("{}@@@@@{}@@@@@{}@@@@@{}", self.timestamp, self.sender_key, self.sender_name, self.payload)
  }
}


#[derive(Serialize, Deserialize, Debug, SerializedBytes)]
#[serde(rename_all = "camelCase")]
pub struct MessageInput{
  signal_type: String,
  payload: String,
  sender_name: String,
  recipients: Vec<AgentPubKey>,
  channel: String,
}





#[hdk_extern]
pub fn join_channel(channel: ChannelMessageInput) -> ExternResult<ActionHash> {
  // 0. clean the channel from existing links to own public key
  clean_channel_links(channel.channel.clone())?;

  // 1. get our own pubkey
  let pubkey = agent_info()?.agent_initial_pubkey;

  // 2. create channel anchor from channel
  let channel_anchor = anchor(
    LinkTypes::SecretAnchor,
    "channel_anchor".into(),
    channel.channel.clone().into()
  )?;

  // 3. link from channel anchor to our own pubkey (for other agents to find us)
  let create_link_hash = create_link(
    channel_anchor,
    pubkey.clone(),
    LinkTypes::ChannelSecretToAgent,
    ())?;

  // 4. send remote signal to members of the group about your joining
  let channel_members = get_channel_members(channel.channel.clone())?;
  let join_channel_message = ChannelMessage {
    signal_type: "JoinChannel".into(),
    agent: pubkey,
    channel: channel.channel,
    username: channel.username,
  };
  let encoded_input = ExternIO::encode(join_channel_message)
  .map_err(|err| wasm_error!(WasmErrorInner::Guest(err.into())))?;
  remote_signal(encoded_input, channel_members)?;

  Ok(create_link_hash)
}

#[hdk_extern]
pub fn get_channel_members(channel: String) -> ExternResult<Vec<AgentPubKey>> {

  // 1. Get links pointing away from the channel channel to member agents
  let links = get_channel_links(channel)?;

  // 2. Add link targets to vector and return
  let mut members = Vec::new();
  for link in links {
    let target = link.target;
    let pubkey = AgentPubKey::from(EntryHash::from(target));
    // let pubkey= target.retype(hdk::prelude::holo_hash::hash_type::Agent);
    members.push(pubkey);
  }

  Ok(members)

}


#[hdk_extern]
pub fn send_msg(input: MessageInput) -> ExternResult<()> {
  // 1. Create message struct
  let sender_key = agent_info()?.agent_initial_pubkey;
  let timestamp = sys_time()?;
  let msg = Message {
    signal_type: input.signal_type,
    payload: input.payload,
    timestamp,
    sender_key,
    sender_name: input.sender_name,
    channel: input.channel,
  };

  // 2. send remote_signal
  let encoded_input = ExternIO::encode(msg.clone())
    .map_err(|err| wasm_error!(WasmErrorInner::Guest(err.into())))?; // Wrapping input
  remote_signal(encoded_input, input.recipients)?; // Doesn't wait

  debug!("+_+_+_+_+_+_+_+_+ SENT SIGNAL WITH PAYLOAD: {:?}", msg);
  Ok(())
}



// CALLBACK WHEN SIGNAL IS RECIEVED
#[hdk_extern]
fn recv_remote_signal(signal: SerializedBytes) -> ExternResult<()> {
  // decode and emit to the UI
  let decoded_message = Message::try_from(signal)
  .map_err(|err| wasm_error!(WasmErrorInner::Guest(err.into())))?;

  debug!("+_+_+_+_+_+_+_+_+_+ JUST RECDEIVED A SIGNAL: {:?}", decoded_message);

  emit_signal(decoded_message)?;

  Ok(())
}


#[hdk_extern]
pub fn signal_test(string_input: String) -> ExternResult<()> {
  let my_agent_pub_key = agent_info()?.agent_latest_pubkey;

  let message = Message {
    signal_type: "Message".into(),
    payload: string_input,
    timestamp: sys_time()?,
    sender_key: my_agent_pub_key.clone(),
    sender_name: "dcts_random_agent_name".into(),
    channel: "randomchannel123".into(),
  };

  let encoded_message = ExternIO::encode(message)
    .map_err(|err| wasm_error!(WasmErrorInner::Guest(err.into())))?; // Wrapping input

  let agents: Vec<AgentPubKey> = vec![my_agent_pub_key];

  remote_signal(encoded_message, agents)?;

  Ok(())
}


fn get_channel_links(channel: String) -> ExternResult<Vec<Link>> {

  // 1. generate channel anchor from channel String
  let channel_anchor = anchor(
    LinkTypes::SecretAnchor,
    "channel_anchor".into(),
    channel.into()
  )?;

  // 2. Get all links from that anchor
  let links = get_links(
    channel_anchor,
    LinkTypes::ChannelSecretToAgent,
    None
  )?;

  Ok(links)
}


/* Deletes all existing links to own public key for a channel */
fn clean_channel_links(channel: String) -> ExternResult<()> {

  let my_pubkey = agent_info()?.agent_initial_pubkey;
  let all_links = get_channel_links(channel)?;

  for link in all_links {
    if AgentPubKey::from(EntryHash::from(link.target)) == my_pubkey {
      delete_link(link.create_link_hash)?;
    }
  }

  Ok(())
}



#[hdk_extern]
pub fn burn_channel(channel: ChannelMessageInput) -> ExternResult<()> {
  // 1. deleta all links pointing away from this channel
  let links = get_channel_links(channel.channel.clone())?;
  for link in links {
    delete_link(link.create_link_hash)?;
  }

  // 2. send remote signal to members of the group about your joining
  let pubkey = agent_info()?.agent_initial_pubkey;
  let channel_members = get_channel_members(channel.channel.clone())?;
  let burn_channel_message = ChannelMessage {
    signal_type: "BurnChannel".into(),
    agent: pubkey,
    channel: channel.channel,
    username: channel.username,
  };
  let encoded_input = ExternIO::encode(burn_channel_message)
  .map_err(|err| wasm_error!(WasmErrorInner::Guest(err.into())))?;

  remote_signal(encoded_input, channel_members)?;

  Ok(())
}

// FEATUREs TO BUILD
// #[hdk_extern]
// pub fn leave_channel(_: ()) -> ExternResult<ActionHash> {
//   unimplemented!()
// }