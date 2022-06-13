use beta_spray_entity::{boulder, prelude::*};
use sea_orm_migration::prelude::*;

pub struct Migration;

impl MigrationName for Migration {
    fn name(&self) -> &str {
        "m20220613_000001_init"
    }
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // boulder table
        sea_query::Table::create()
            .table(Boulder)
            .if_not_exists()
            .col(
                ColumnDef::new(boulder::Column::Id)
                    .integer()
                    .not_null()
                    .auto_increment()
                    .primary_key(),
            )
            .col(ColumnDef::new(boulder::Column::Name).string().not_null())
            .col(ColumnDef::new(boulder::Column::Text).string().not_null())
            .to_owned()
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        todo!()
    }
}
