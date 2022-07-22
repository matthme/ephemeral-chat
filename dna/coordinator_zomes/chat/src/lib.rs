
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
pub fn join_channel(input: ChannelMessageInput) -> ExternResult<ActionHash> {
  // 0. clean the channel from existing links to own public key
  clean_channel_links(input.channel.clone())?;
  let username = input.username;
  let channel_to_join = input.channel;

  // 1. get our own pubkey
  let pubkey = agent_info()?.agent_initial_pubkey;

  // 2. create channel anchor from channel
  let channel_anchor = anchor(
    LinkTypes::SecretAnchor,
    "channel_anchor".into(),
    channel_to_join.clone().into(),
  )?;

  // 3. link from channel anchor to our own pubkey (for other agents to find us)
  let create_link_hash = create_link(
    channel_anchor,
    pubkey.clone(),
    LinkTypes::ChannelSecretToAgent,
    LinkTag::new(username.clone()))?;

  // 4. send remote signal to members of the group about your joining
  let channel_members = get_channel_members(channel_to_join.clone())?;
  let join_channel_message = ChannelMessage {
    signal_type: "JoinChannel".into(),
    agent: pubkey,
    channel: channel_to_join,
    username: username,
  };
  let encoded_input = ExternIO::encode(join_channel_message)
  .map_err(|err| wasm_error!(WasmErrorInner::Guest(err.into())))?;

  // dispatch remote signal
  let agents: Vec<AgentPubKey> = channel_members
    .into_iter()
    .map(|(agent_pub_key, _)| agent_pub_key).collect();
  remote_signal(encoded_input, agents)?;

  Ok(create_link_hash)
}


#[hdk_extern]
pub fn get_channel_members(channel: String) -> ExternResult<Vec<(AgentPubKey, String)>> {
  // 1. Get links pointing away from the channel channel to member agents
  let links = get_channel_links(channel)?;
  // 2. Add link targets to vector and return
  let mut members = Vec::new();
  for link in links {
    let target = link.target;
    let pubkey = AgentPubKey::from(EntryHash::from(target));
    let username: String = tag_to_string(link.tag)?;
    members.push((pubkey, username));
  }

  Ok(members)
}

// @TODO how to convert from LinkTag to String
pub fn tag_to_string(tag: LinkTag) -> ExternResult<String> {
  String::from_utf8(tag.0)
    .map_err(|_err| wasm_error!(WasmErrorInner::Guest("Could not convert tag to string".into())))
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
  let maybe_decoded_message = Message::try_from(signal.clone());
  match maybe_decoded_message {
    Ok(message) => {
      debug!("💌💌💌💌 Agent {:?} RECEIVED SIGNAL: {:?}", agent_info()?.agent_initial_pubkey,  message);
      emit_signal(message)?;
      Ok(())
    },
    Err(_) => {
      let maybe_decoded_channel_message = ChannelMessage::try_from(signal);
      match maybe_decoded_channel_message {
        Ok(message) => {
          debug!("💌💌💌💌 Agent {:?} RECEIVED CHANNEL MESSAGE SIGNAL: {:?}", agent_info()?.agent_initial_pubkey, message);
          emit_signal(message)?;
          Ok(())
        },
        Err(err) => Err(wasm_error!(WasmErrorInner::Guest(err.into())))
      }
    }
  }
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
pub fn burn_channel(input: ChannelMessageInput) -> ExternResult<()> {
  let channel_members = get_channel_members(input.channel.clone())?;

  // 1. delete all links pointing away from this channel
  let links = get_channel_links(input.channel.clone())?;
  for link in links {
    delete_link(link.create_link_hash)?;
  }

  // 2. send remote signal to members of the group about your joining
  let pubkey = agent_info()?.agent_initial_pubkey;
  let burn_channel_message = ChannelMessage {
    signal_type: "BurnChannel".into(),
    agent: pubkey,
    channel: input.channel,
    username: input.username,
  };
  let encoded_input = ExternIO::encode(burn_channel_message)
  .map_err(|err| wasm_error!(WasmErrorInner::Guest(err.into())))?;


  let agents: Vec<AgentPubKey> = channel_members
    .into_iter()
    .map(|(agent_pub_key, _)| agent_pub_key).collect();

  remote_signal(encoded_input, agents)?;

  Ok(())
}

// FEATUREs TO BUILD
// #[hdk_extern]
// pub fn leave_channel(_: ()) -> ExternResult<ActionHash> {
//   unimplemented!()
// }