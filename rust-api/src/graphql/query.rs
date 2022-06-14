use async_graphql::{Context, Object};

pub struct QueryRoot;

/// Root GraphQL query object
#[Object]
impl QueryRoot {
    async fn ass<'a>(&self, _ctx: &Context<'a>) -> String {
        "ass".to_string()
    }
}
