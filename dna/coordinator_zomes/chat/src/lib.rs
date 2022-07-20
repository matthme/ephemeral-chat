
mod entry_def_0;
pub use entry_def_0::*;
use hdk::prelude::*;
use chat_integrity::*;




#[derive(Serialize, Deserialize, Debug)]
pub struct Message(char);








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



#[hdk_extern]
pub fn get_my_groups(_: ()) -> ExternResult<Vec<GroupInfo>> {
  unimplemented!()
  // get all links from my pubkey to GroupSecret
  // add link tags to vector and return



}


// #[hdk_extern]
// pub fn leave_group(_: ()) -> ExternResult<ActionHash> {
//   unimplemented!()
// }

#[hdk_extern]
pub fn get_group_members(_: GroupSecret) -> ExternResult<Vec<AgentPubKey>> {
  unimplemented!()
}


#[hdk_extern]
pub fn send_letter(char: Message) -> ExternResult<()> {
  unimplemented!()
  // {
  //   letter: char,
  //   timestamp: i32
  // }
  // send remote_signal
}



#[hdk_extern]
fn recv_remote_signal(signal: SerializedBytes) -> ExternResult<()> {
    // decode and emit to the UI
    emit_signal(&signal)?;
    Ok(())
}

