use hdk::prelude::*;

#[hdk_extern]
pub fn ping(_: ()) -> ExternResult<String> {
  warn!("Is progenitor: {}", utils::check_if_progenitor()?);
  Ok("Pong".to_string())
}
