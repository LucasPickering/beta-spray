use crate::graphql::query::QueryRoot;
use async_graphql::{EmptyMutation, EmptySubscription, Schema};

pub mod query;

pub type BetaSpraySchema = Schema<QueryRoot, EmptyMutation, EmptySubscription>;
