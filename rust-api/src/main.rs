use crate::graphql::{query::QueryRoot, BetaSpraySchema};
use async_graphql::{
    http::{playground_source, GraphQLPlaygroundConfig},
    EmptyMutation, EmptySubscription, Schema,
};
use async_graphql_axum::{GraphQLRequest, GraphQLResponse};
use axum::{
    response::{self, IntoResponse},
    routing::get,
    Extension, Router, Server,
};
use sqlx::postgres::PgPoolOptions;
use std::env;
use tower_http::trace::TraceLayer;
use tracing_subscriber::prelude::*;

mod graphql;

#[tokio::main]
async fn main() {
    // Logging setup
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG")
                .unwrap_or_else(|_| "beta_spray_api=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // GraphQL setup
    let schema = Schema::build(QueryRoot, EmptyMutation, EmptySubscription).finish();

    // DB setup
    let _pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&env::var("DATABASE_URL").unwrap())
        .await
        .unwrap();

    // HTTP setup
    let app = Router::new()
        .route("/", get(graphql_playground).post(graphql_handler))
        .layer(TraceLayer::new_for_http())
        .layer(Extension(schema));

    // Start HTTP server
    // TODO config mgt
    let host = env::var("HOST").unwrap();
    let port = env::var("PORT").unwrap();
    let address = format!("{host}:{port}");
    tracing::debug!("listening on {}", address);
    Server::bind(&address.parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn graphql_handler(
    schema: Extension<BetaSpraySchema>,
    req: GraphQLRequest,
) -> GraphQLResponse {
    schema.execute(req.into_inner()).await.into()
}

async fn graphql_playground() -> impl IntoResponse {
    response::Html(playground_source(GraphQLPlaygroundConfig::new("/")))
}
