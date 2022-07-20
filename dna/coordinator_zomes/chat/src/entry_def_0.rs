use hdk::prelude::*;
use chat_integrity::EntryDef0;
use chat_integrity::EntryTypes;

#[hdk_extern]
pub fn get_entry_def_0(entry_hash: EntryHash) -> ExternResult<Option<EntryDef0>> {
  let maybe_element = get(entry_hash, GetOptions::default())?;

  match maybe_element {
    None => Ok(None),
    Some(record) => {
      let entry_def_0: EntryDef0 = record.entry()
        .to_app_option()
        .map_err(|error| wasm_error!(WasmErrorInner::Guest(format!("Could not deserialize Record to EntryDef0: {}", error))))?
        .ok_or(wasm_error!(WasmErrorInner::Guest("No EntryDef0 found for the given hash.".into())))?;

      Ok(Some(entry_def_0))
    }
  }
}


#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct NewEntryDef0Output {
  action_hash: ActionHash,
  entry_hash: EntryHash,
}

#[hdk_extern]
pub fn create_entry_def_0(entry_def_0: EntryDef0) -> ExternResult<NewEntryDef0Output> {
  let action_hash = create_entry(&EntryTypes::EntryDef0(entry_def_0.clone()))?;

  let entry_hash = hash_entry(&EntryTypes::EntryDef0(entry_def_0))?;

  let output = NewEntryDef0Output {
    action_hash,
    entry_hash
  };

  Ok(output)
}


#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UpdateEntryDef0Input {
  original_action_hash: ActionHash,
  updated_entry_def_0: EntryDef0
}

#[hdk_extern]
pub fn update_entry_def_0(input: UpdateEntryDef0Input) -> ExternResult<NewEntryDef0Output> {
  let action_hash = update_entry(input.original_action_hash, &input.updated_entry_def_0)?;

  let entry_hash = hash_entry(&input.updated_entry_def_0)?;

  let output = NewEntryDef0Output {
    action_hash,
    entry_hash
  };

  Ok(output)
}


#[hdk_extern]
pub fn delete_entry_def_0(action_hash: ActionHash) -> ExternResult<ActionHash> {
  delete_entry(action_hash)
}

