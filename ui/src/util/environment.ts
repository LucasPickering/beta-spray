import {
  Environment,
  Network,
  RecordSource,
  Store,
  FetchFunction,
} from "relay-runtime";

const fetchQuery: FetchFunction = (
  operation,
  variables,
  cacheConfig,
  uploadables
) => {
  const request: RequestInit = {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  };

  if (uploadables) {
    const formData = new FormData();
    formData.append("query", operation.text ?? "");
    formData.append("variables", JSON.stringify(variables));

    Object.keys(uploadables).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(uploadables, key)) {
        formData.append(key, uploadables[key]);
      }
    });

    request.body = formData;
  } else {
    (request.headers as Record<string, string>)["Content-Type"] =
      "application/json";
    request.body = JSON.stringify({
      query: operation.text,
      variables,
    });
  }

  return fetch("/api/graphql", request)
    .then((response) => {
      // An HTTP error indicates something went wrong below GQL on the stack,
      // so raise that as an exception
      if (response.status >= 400) {
        throw response;
      }

      return response.json();
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error("API request error", error);
      // Re-throw so this can be caught by useMutation. ErrorBoundary should
      // catch for data queries
      throw error;
    });
};

const environment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
});

export default environment;
