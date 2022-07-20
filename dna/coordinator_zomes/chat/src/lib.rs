
use hdk::prelude::*;
use chat_integrity::*;



#[derive(Serialize, SerializedBytes, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Message {
  payload: String,
  timestamp: Timestamp,
  sender_key: AgentPubKey,
  sender_name: String,
  secret: String,
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
  payload: String,
  sender_name: String,
  recipients: Vec<AgentPubKey>,
  secret: String,
}





#[hdk_extern]
pub fn join_channel(secret: String) -> ExternResult<ActionHash> {
  // 1. get our own pubkey
  let pubkey = agent_info()?.agent_initial_pubkey;

  // 2. create secret anchor from secret
  let secret_anchor = anchor(
    LinkTypes::SecretAnchor,
    "secret_anchor".into(),
    secret.into()
  )?;

  // 3. link from secret anchor to our own pubkey (for other agents to find us)
  let create_link_hash = create_link(
    secret_anchor,
    pubkey,
    LinkTypes::ChannelSecretToAgent,
    ())?;

  Ok(create_link_hash)

}

#[hdk_extern]
pub fn get_channel_members(secret: String) -> ExternResult<Vec<AgentPubKey>> {

  // 1. generate secret anchor from secret String
  let secret_anchor = anchor(
    LinkTypes::SecretAnchor,
    "secret_anchor".into(),
    secret.into()
  )?;

  // 2. Get all links from that anchor
  let links = get_links(
    secret_anchor,
    LinkTypes::ChannelSecretToAgent,
    None
  )?;

  // 3. Add link targets to vector and return
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
    payload: input.payload,
    timestamp,
    sender_key,
    sender_name: input.sender_name,
    secret: input.secret,
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
    payload: string_input,
    timestamp: sys_time()?,
    sender_key: my_agent_pub_key.clone(),
    sender_name: "dcts_random_agent_name".into(),
    secret: "randomsecret123".into(),
  };

  let encoded_message = ExternIO::encode(message)
    .map_err(|err| wasm_error!(WasmErrorInner::Guest(err.into())))?; // Wrapping input

  let agents: Vec<AgentPubKey> = vec![my_agent_pub_key];

  remote_signal(encoded_message, agents)?;

  Ok(())
}



// FEATUREs TO BUILD
// #[hdk_extern]
// pub fn leave_channel(_: ()) -> ExternResult<ActionHash> {
//   unimplemented!()
// }