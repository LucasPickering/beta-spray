use crate::util::{Cached, Dimensions};
use async_graphql::{Object, SimpleObject, ID};

pub struct QueryRoot;

/// Root GraphQL query object
#[Object]
impl QueryRoot {
    async fn boulders<'a>(
        &self,
        _after: Option<String>,
        _before: Option<String>,
        _first: Option<i32>,
        _last: Option<i32>,
    ) -> BoulderNode {
        todo!()
    }

    async fn boulder<'a>(&self) -> BoulderNode {
        todo!()
    }
}

#[derive(SimpleObject)]
pub struct BoulderNode {
    id: ID,
    // TODO created_at
}

#[derive(SimpleObject)]
pub struct Image {
    url: String,
    #[graphql(skip)]
    dimensions: Cached<Dimensions>,
}
