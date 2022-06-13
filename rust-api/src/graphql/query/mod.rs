use async_graphql::{Context, Object};

pub struct QueryRoot;

#[Object]
impl QueryRoot {
    async fn ass<'a>(&self, _ctx: &Context<'a>) -> String {
        "ass".to_string()
    }
}
