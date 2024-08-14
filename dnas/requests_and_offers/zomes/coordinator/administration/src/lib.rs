pub mod administration;
mod external_calls;
pub mod status;

use hdk::prelude::*;

#[hdk_extern]
pub fn init(_: ()) -> ExternResult<InitCallbackResult> {
  Ok(InitCallbackResult::Pass)
}
