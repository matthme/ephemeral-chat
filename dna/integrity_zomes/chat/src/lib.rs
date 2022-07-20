use hdi::prelude::*;

mod entry_def_0;
pub use entry_def_0::EntryDef0;


#[hdk_entry_defs]
#[unit_enum(UnitEntryTypes)]
pub enum EntryTypes {
#[entry_def()]
EntryDef0(EntryDef0),

}

#[hdk_link_types]
pub enum LinkTypes {
  GroupSecretToAgent,
  SecretAnchor,
}


#[hdk_extern]
pub fn validate(_op: Op) -> ExternResult<ValidateCallbackResult> {
  Ok(ValidateCallbackResult::Valid)
}
