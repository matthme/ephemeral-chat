
mod entry_def_0;
pub use entry_def_0::*;
use hdk::prelude::*;
use chat_integrity::*;



#[derive(Serialize, Deserialize, Debug)]
pub struct GroupSecret(String);


#[derive(Serialize, Deserialize, Debug)]
pub struct Message(char);



#[hdk_extern]
pub fn create_group(secret: GroupSecret) -> ExternResult<ActionHash> {
  let hashed_secret = hash(secret);


  let action_hash = create_link(hashed_secret, LinkTypes::GroupSecretToAgent)?;
  unimplemented!()
}


#[hdk_extern]
pub fn join_group(secret: GroupSecret) -> ExternResult<ActionHash> {
  unimplemented!()
}


#[hdk_extern]
pub fn get_my_groups(_: ()) -> ExternResult<Vec<GroupSecret>> {
  unimplemented!()
}


#[hdk_extern]
pub fn leave_group(_: ()) -> ExternResult<ActionHash> {
  unimplemented!()
}

#[hdk_extern]
pub fn get_group_members(_: GroupSecret) -> ExternResult<Vec<AgentPubKey>> {
  unimplemented!()
}


#[hdk_extern]
pub fn send_letter(char: Message) -> ExternResult<()> {
  unimplemented!()
  // send remote_signal
}



#[hdk_extern]
fn recv_remote_signal(signal: SerializedBytes) -> ExternResult<()> {

    emit_signal(&signal)?;
    Ok(())
}

