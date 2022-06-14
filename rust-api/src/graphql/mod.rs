use crate::graphql::query::QueryRoot;
use async_graphql::{EmptyMutation, EmptySubscription, Schema};
use std::{io, path::Path};
use tokio::{fs::File, io::AsyncWriteExt}; // for write_all()

pub mod query;

pub type BetaSpraySchema = Schema<QueryRoot, EmptyMutation, EmptySubscription>;

/// Write the given GraphQL schema to disk
pub async fn export_schema(
    schema: &BetaSpraySchema,
    path: impl AsRef<Path> + Copy,
) -> Result<(), io::Error> {
    let mut file = File::create(path).await?;
    file.write_all(schema.sdl().as_bytes()).await?;
    tracing::info!("Wrote API schema to {}", path.as_ref().display());
    Ok(())
}
