use figment::{
    providers::{Env, Format, Toml},
    Figment,
};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Location of the config file to be loaded (relative to project root)
pub const CONFIG_PATH: &str = "./beta_spray.toml";

/// App-level configuration. Use [Self::load] to load from files/env.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BetaSprayConfig {
    /// Log filter string, in the format accepted by
    /// [tracing_subscriber::EnvFilter]
    pub log_filter: String,
    /// Host address to serve HTTP traffic on
    pub host: String,
    /// Port to serve HTTP traffic on
    pub port: u32,
    /// URL of the database instance, in postgres URL format
    ///
    /// Loaded from the `DATABASE_URL` variable, rather than the default
    /// prefix, in order to match the behavior of sqlx.
    pub database_url: String,
    /// Path to export the generate GraphQL schema to
    pub schema_path: PathBuf,
}

impl BetaSprayConfig {
    /// Load config from the pre-defined file, as well as from environment
    /// variables with the prefix `BETA_SPRAY_`.
    pub fn load() -> Result<Self, figment::Error> {
        Figment::new()
            .merge(Toml::file(CONFIG_PATH))
            .merge(Env::prefixed("BETA_SPRAY_"))
            // Overridden to match sqlx
            .merge(Env::raw().only(&["DATABASE_URL"]))
            .extract()
    }
}
