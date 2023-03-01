import {
  Environment,
  Network,
  RecordSource,
  Store,
  FetchFunction,
} from "relay-runtime";
import { HTTPError } from "./error";

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

  // Request format depends on whether or not we're attaching files
  if (uploadables) {
    // Structure the request according to strawberry's instructions:
    // https://strawberry.rocks/docs/guides/file-upload#sending-file-upload-requests
    const formData = new FormData();
    formData.append(
      "operations",
      JSON.stringify({ query: operation.text, variables })
    );

    // We need to build a map to tell the API how to map the attached file(s)
    // to the input variables. The caller should name each file to correspond
    // to the query variables.
    const variableMap: Record<string, string[]> = {};
    Object.entries(uploadables).forEach(([key, uploadable]) => {
      variableMap[key] = [`variables.${key}`];
      formData.append(key, uploadable);
    });
    formData.append("map", JSON.stringify(variableMap));

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
        throw new HTTPError(response);
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
