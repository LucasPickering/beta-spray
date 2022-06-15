use std::future::Future;

/// A container that lazily fetches a value, then caches it for all future
/// accesses. The value will be fetched upon first access, then stored locally
/// thereafter. Intended for short-term caching, e.g. to prevent duplicate
/// async operations during the resolution of a single GraphQL request.
pub struct Cached<T, Fut: Future<Output = T>, Fetch: Fn() -> Fut> {
    value: Option<T>,
    fetch: Fetch,
}

impl<T, Fut: Future<Output = T>, Fetch: Fn() -> Fut> Cached<T, Fut, Fetch> {
    /// Build a new cache container. The given function will be used to populate
    /// the cache upon first access.
    pub fn new(fetch: Fetch) -> Self {
        Self { value: None, fetch }
    }

    /// Get the cached value. If the value hasn't been fetched yet, this will
    /// fetch it asynchronously, then return it.
    pub async fn get(&mut self) -> &T {
        // Unwrap is necessary here because we can't hold onto a ref to
        // self.value while mutating it, so a `match` or `if let` doesn't work
        if self.value.is_none() {
            self.value = Some((self.fetch)().await);
        }
        self.value.as_ref().unwrap()
    }
}

/// 2D dimensions, e.g. of an image
#[derive(Copy, Clone, Debug)]
pub struct Dimensions {
    pub width: usize,
    pub height: usize,
}
