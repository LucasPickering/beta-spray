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

  return fetch("/api/graphql", request).then((response) => {
    // TODO don't crash if response isn't JSON
    return response.json();
  });
};

const environment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
});

export default environment;
