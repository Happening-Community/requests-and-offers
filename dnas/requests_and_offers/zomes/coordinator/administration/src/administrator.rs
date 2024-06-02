use crate::*;
use administration_integrity::*;
use hdk::prelude::*;

#[hdk_extern]
pub fn create_administrator(administrator: Administrator) -> ExternResult<Record> {
    let administrator_hash = create_entry(&EntryTypes::Administrator(administrator.clone()))?;
    let record = get(administrator_hash.clone(), GetOptions::default())?
        .ok_or(wasm_error("Could not find the newly created Administrator"))?;
    let path = Path::from("administrators");
    create_link(
        path.path_entry_hash()?,
        administrator_hash.clone(),
        LinkTypes::AllAdministrators,
        (),
    )?;
    Ok(record)
}

#[hdk_extern]
pub fn get_latest_administrator(
    original_administrator_hash: ActionHash,
) -> ExternResult<Option<Record>> {
    let links = get_links(
        original_administrator_hash.clone(),
        LinkTypes::AdministratorUpdates,
        None,
    )?;
    let latest_link = links
        .into_iter()
        .max_by(|link_a, link_b| link_a.timestamp.cmp(&link_b.timestamp));
    let latest_administrator_hash = match latest_link {
        Some(link) => link
            .target
            .clone()
            .into_action_hash()
            .ok_or(wasm_error("No action hash associated with link"))?,
        None => original_administrator_hash.clone(),
    };
    get(latest_administrator_hash, GetOptions::default())
}

#[hdk_extern]
pub fn get_original_administrator(
    original_administrator_hash: ActionHash,
) -> ExternResult<Option<Record>> {
    let Some(details) = get_details(original_administrator_hash, GetOptions::default())? else {
        return Ok(None);
    };
    match details {
        Details::Record(details) => Ok(Some(details.record)),
        _ => Err(wasm_error("Malformed get details response")),
    }
}

#[hdk_extern]
pub fn get_all_revisions_for_administrator(
    original_administrator_hash: ActionHash,
) -> ExternResult<Vec<Record>> {
    let Some(original_record) = get_original_administrator(original_administrator_hash.clone())?
    else {
        return Ok(vec![]);
    };
    let links = get_links(
        original_administrator_hash.clone(),
        LinkTypes::AdministratorUpdates,
        None,
    )?;
    let get_input: Vec<GetInput> = links
        .into_iter()
        .map(|link| {
            Ok(GetInput::new(
                link.target
                    .into_action_hash()
                    .ok_or(wasm_error("No action hash associated with link"))?
                    .into(),
                GetOptions::default(),
            ))
        })
        .collect::<ExternResult<Vec<GetInput>>>()?;
    let records = HDK.with(|hdk| hdk.borrow().get(get_input))?;
    let mut records: Vec<Record> = records.into_iter().filter_map(|r| r).collect();
    records.insert(0, original_record);
    Ok(records)
}
#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateAdministratorInput {
    pub original_administrator_hash: ActionHash,
    pub previous_administrator_hash: ActionHash,
    pub updated_administrator: Administrator,
}

#[hdk_extern]
pub fn update_administrator(input: UpdateAdministratorInput) -> ExternResult<Record> {
    let updated_administrator_hash = update_entry(
        input.previous_administrator_hash.clone(),
        &input.updated_administrator,
    )?;
    create_link(
        input.original_administrator_hash.clone(),
        updated_administrator_hash.clone(),
        LinkTypes::AdministratorUpdates,
        (),
    )?;
    let record = get(updated_administrator_hash.clone(), GetOptions::default())?
        .ok_or(wasm_error("Could not find the newly updated Administrator"))?;
    Ok(record)
}

#[hdk_extern]
pub fn delete_administrator(original_administrator_hash: ActionHash) -> ExternResult<ActionHash> {
    let details = get_details(original_administrator_hash.clone(), GetOptions::default())?
        .ok_or(wasm_error("{pascal_entry_def_name} not found"))?;
    let record = match details {
        Details::Record(details) => Ok(details.record),
        _ => Err(wasm_error("Malformed get details response")),
    }?;
    let path = Path::from("administrators");
    let links = get_links(path.path_entry_hash()?, LinkTypes::AllAdministrators, None)?;
    for link in links {
        if let Some(hash) = link.target.into_action_hash() {
            if hash.eq(&original_administrator_hash) {
                delete_link(link.create_link_hash)?;
            }
        }
    }
    delete_entry(original_administrator_hash)
}

#[hdk_extern]
pub fn get_all_deletes_for_administrator(
    original_administrator_hash: ActionHash,
) -> ExternResult<Option<Vec<SignedActionHashed>>> {
    let Some(details) = get_details(original_administrator_hash, GetOptions::default())? else {
        return Ok(None);
    };
    match details {
        Details::Entry(_) => Err(wasm_error("Malformed details")),
        Details::Record(record_details) => Ok(Some(record_details.deletes)),
    }
}

#[hdk_extern]
pub fn get_oldest_delete_for_administrator(
    original_administrator_hash: ActionHash,
) -> ExternResult<Option<SignedActionHashed>> {
    let Some(mut deletes) = get_all_deletes_for_administrator(original_administrator_hash)? else {
        return Ok(None);
    };
    deletes.sort_by(|delete_a, delete_b| {
        delete_a
            .action()
            .timestamp()
            .cmp(&delete_b.action().timestamp())
    });
    Ok(deletes.first().cloned())
}

#[hdk_extern]
pub fn get_all_administrators(_: ()) -> ExternResult<Vec<Link>> {
    let path = Path::from("administrators");
    get_links(path.path_entry_hash()?, LinkTypes::AllAdministrators, None)
}
