use hdk::prelude::*;
use helpers::progenitor::DnaProperties;

mod helpers;

#[hdk_extern]
pub fn ping(_: ()) -> ExternResult<String> {
    Ok("Pong".to_string())
}

#[hdk_extern]
pub fn get_dna_properties(_: ()) -> ExternResult<DnaProperties> {
    DnaProperties::get()
}
