pub mod dna_properties;
pub mod types;

pub use dna_properties::DnaProperties;
pub use types::*;

use std::io::Cursor;

use hdk::prelude::*;
use image::io::Reader as ImageReader;
use serde::{de::DeserializeOwned, Serialize};
use std::fmt::Debug;
use WasmErrorInner::*;

pub fn check_if_progenitor() -> ExternResult<bool> {
  let progenitor_pubkey = DnaProperties::get_progenitor_pubkey()?;

  Ok(progenitor_pubkey == agent_info()?.agent_initial_pubkey)
}

pub fn get_original_record(original_action_hash: ActionHash) -> ExternResult<Option<Record>> {
  let Some(details) = get_details(original_action_hash, GetOptions::default())? else {
    return Ok(None);
  };

  match details {
    Details::Record(details) => Ok(Some(details.record)),
    _ => Err(wasm_error!(Guest("Details is not a record".to_string()))),
  }
}

pub fn get_all_revisions_for_entry(
  original_action_hash: ActionHash,
  link_types: impl LinkTypeFilterExt,
) -> ExternResult<Vec<Record>> {
  let Some(original_record) = get_original_record(original_action_hash.clone())? else {
    return Ok(vec![]);
  };

  let links =
    get_links(GetLinksInputBuilder::try_new(original_action_hash.clone(), link_types)?.build())?;

  let records: Vec<Option<Record>> = links
    .into_iter()
    .map(|link| {
      get(
        link.target.into_action_hash().ok_or(wasm_error!(Guest(
          "No action hash associated with link".to_string()
        )))?,
        GetOptions::default(),
      )
    })
    .collect::<ExternResult<Vec<Option<Record>>>>()?;
  let mut records: Vec<Record> = records.into_iter().flatten().collect();
  records.insert(0, original_record);

  Ok(records)
}

pub fn external_local_call<I, T>(fn_name: &str, zome_name: &str, payload: I) -> ExternResult<T>
where
  I: Clone + Serialize + Debug,
  T: Debug + DeserializeOwned,
{
  let zome_call_response = call(
    CallTargetCell::Local,
    ZomeName(zome_name.to_owned().into()),
    FunctionName(fn_name.into()),
    None,
    payload.clone(),
  )?;

  match zome_call_response {
    ZomeCallResponse::Ok(response) => Ok(response.decode().map_err(|e| wasm_error!(Serialize(e)))?),
    _ => Err(wasm_error!(Host(format!(
      "Error while calling the {} function of the {} zome",
      fn_name, zome_name
    )))),
  }
}

pub fn timetamp_now() -> Timestamp {
  Timestamp::from_micros(chrono::UTC::now().timestamp_subsec_micros() as i64)
}

pub fn is_image(bytes: SerializedBytes) -> bool {
  let data = bytes.bytes().to_vec();
  let reader = match ImageReader::new(Cursor::new(data)).with_guessed_format() {
    Ok(reader) => reader,
    Err(_) => return false,
  };

  reader.decode().is_ok()
}

pub fn delete_links(
  base_address: impl Into<AnyLinkableHash>,
  link_type: impl LinkTypeFilterExt,
) -> ExternResult<bool> {
  let organization_updates_links =
    get_links(GetLinksInputBuilder::try_new(base_address, link_type)?.build())?;

  for link in organization_updates_links {
    delete_link(link.create_link_hash)?;
  }

  Ok(true)
}
