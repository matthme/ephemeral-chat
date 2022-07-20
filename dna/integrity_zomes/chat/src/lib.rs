use hdi::prelude::*;

#[hdk_link_types]
pub enum LinkTypes {
  GroupSecretToAgent,
  SecretAnchor,
}

#[hdk_extern]
pub fn validate(_op: Op) -> ExternResult<ValidateCallbackResult> {
  Ok(ValidateCallbackResult::Valid)
}
