use hdi::prelude::*;
use hdk::prelude::{InitCallbackResult, create_cap_grant};

#[hdk_link_types]
pub enum LinkTypes {
  ChannelSecretToAgent,
  SecretAnchor,
}



#[hdk_extern]
pub fn init(_: ()) -> ExternResult<InitCallbackResult> {

  let mut functions = BTreeSet::new();
  functions.insert(("chat".into(), FunctionName::from("recv_remote_signal".to_string())));
  let cap_grant = CapGrantEntry {
    tag: "".into(),
    access: CapAccess::Unrestricted,
    functions,
  };

  create_cap_grant(cap_grant)?;
  Ok(InitCallbackResult::Pass)
}

// TODO: Add cap grant to receive remote signals

#[hdk_extern]
pub fn validate(_op: Op) -> ExternResult<ValidateCallbackResult> {
  Ok(ValidateCallbackResult::Valid)
}
