use hdi::prelude::*;





#[hdk_entry_helper]
#[serde(rename_all = "camelCase")]
#[derive(Clone)]
pub struct EntryDef0 {
  pub title: String,
  pub content: String,
}