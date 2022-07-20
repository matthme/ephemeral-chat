
mod entry_def_0;
pub use entry_def_0::*;
use hdk::prelude::*;
use chat_integrity::*;



#[derive(Serialize, Deserialize, Debug)]
pub struct GroupInfo{
  secret: String,
  hashed_secret: Vec<u8>,
};




#[derive(Serialize, Deserialize, Debug)]
pub struct Message(char);



#[hdk_extern]
pub fn join_group(secret: String) -> ExternResult<ActionHash> {

  let hashed_secret = hash_sha256(secret.into_vec());

  // create HoloHash from hashed_secret

  // get all existinglinks
  // create two links Me <-> Secret & Secret <-> Me
  // if there are agents already linked to this Secret --> send signal

  let action_hash = create_link(hashed_secret, agent_pub_key,  LinkTypes::GroupSecretToAgent, secret.into())?;
  unimplemented!()

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

