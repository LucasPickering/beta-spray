use crate::{
    config::BetaSprayConfig,
    graphql::{query::QueryRoot, BetaSpraySchema},
};
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
use tower_http::trace::TraceLayer;
use tracing_subscriber::prelude::*;

mod config;
mod graphql;

#[tokio::main]
async fn main() {
    let config = BetaSprayConfig::load().unwrap();

    // Logging setup
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(config.log_filter))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // GraphQL setup
    let schema =
        Schema::build(QueryRoot, EmptyMutation, EmptySubscription).finish();
    // Write schema to disk so UI can access it
    // TODO read this path from config
    graphql::export_schema(&schema, &config.schema_path)
        .await
        .unwrap();

    // DB setup
    let _pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&config.database_url)
        .await
        .unwrap();

    // HTTP setup
    let app = Router::new()
        .route("/", get(graphql_playground).post(graphql_handler))
        .layer(TraceLayer::new_for_http())
        .layer(Extension(schema));

    // Start HTTP server
    let address = format!("{}:{}", &config.host, &config.port);
    tracing::info!("Listening on {}", address);
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
