import {
  Environment,
  Network,
  RecordSource,
  Store,
  FetchFunction,
} from "relay-runtime";
import imageCompression from "browser-image-compression";
import { HTTPError } from "./error";

const maxUploadSizeMB = 0.2; // 200 KB

/**
 * Network handler for Relay operations.
 *
 * @param operation Relay operation (query or mutation)
 * @param variables Variable key:value mapping
 * @param cacheConfig ???
 * @param uploadables Map of uploadable files. Each file will be compressed
 *  before being uploaded
 */
const fetchQuery: FetchFunction = async (
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
    // to the query variables. We'll compress each file as we do this
    const variableMap: Record<string, string[]> = {};
    for (const [key, uploadable] of Object.entries(uploadables)) {
      variableMap[key] = [`variables.${key}`];
      // Technically we could make compress concurrent, but doesn't seem worth
      // it since it's CPU-bound anyway so it probably won't save cycles.
      const compressed = await imageCompression(
        // Not sure what will happen if we pass a plain Blob in here, but let's
        // just not find out!
        uploadable as File,
        { maxSizeMB: maxUploadSizeMB }
      );
      formData.append(key, compressed);
    }
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

  try {
    const response = await fetch("/api/graphql", request);

    // An HTTP error indicates something went wrong below GQL on the stack,
    // so raise that as an exception
    if (response.status >= 400) {
      throw new HTTPError(response);
    }

    return response.json();
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("API request error", error);
    // Re-throw so this can be caught by useMutation. ErrorBoundary should
    // catch for data queries
    throw error;
  }
};

const environment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
});

export default environment;
