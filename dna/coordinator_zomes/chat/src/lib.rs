
mod entry_def_0;
pub use entry_def_0::*;
use hdk::prelude::*;
use chat_integrity::*;



#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Message{
  payload: String,
  timestamp: Timestamp,
  sender_key: AgentPubKey,
  sender_name: String,
}


impl Message {
  fn encode(&self) -> String {
    format!("{}@@@@@{}@@@@@{}@@@@@{}", self.timestamp, self.sender_key, self.sender_name, self.payload)
  }
}


#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct MessageInput{
  payload: String,
  sender_name: String,
  recipients: Vec<AgentPubKey>,
}





#[hdk_extern]
pub fn join_group(secret: String) -> ExternResult<ActionHash> {
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
    LinkTypes::GroupSecretToAgent,
    ())?;

  Ok(create_link_hash)

}



// #[hdk_extern]
// pub fn leave_group(_: ()) -> ExternResult<ActionHash> {
//   unimplemented!()
// }


#[hdk_extern]
pub fn get_group_members(secret: String) -> ExternResult<Vec<AgentPubKey>> {

  // 1. generate secret anchor from secret String
  let secret_anchor = anchor(
    LinkTypes::SecretAnchor,
    "secret_anchor".into(),
    secret.into()
  )?;

  // 2. Get all links from that anchor
  let links = get_links(
    secret_anchor,
    LinkTypes::SecretAnchor,
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
  // let members: Vec<AgentPubKey> = links.iter().map(|link| AgentPubKey::try_from(link.target)?).collect();

}


#[hdk_extern]
pub fn send_letter(input: MessageInput) -> ExternResult<()> {

  // 1. Create message struct

  let sender_key = agent_info()?.agent_initial_pubkey;
  let timestamp = sys_time()?;

  let msg = Message {
    payload: input.payload,
    timestamp,
    sender_key,
    sender_name: input.sender_name,
  };

  let encoded_input = ExternIO::encode(msg)
    .map_err(|err| wasm_error!(WasmErrorInner::Guest(err.into())))?; // Wrapping input


  // 2. send remote_signal
  remote_signal(encoded_input, input.recipients)?; // Doesn't wait

  Ok(())

}



#[hdk_extern]
fn recv_remote_signal(signal: SerializedBytes) -> ExternResult<()> {
    // decode and emit to the UI
    emit_signal(&signal)?;
    Ok(())
}

