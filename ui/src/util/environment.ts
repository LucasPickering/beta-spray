import {
  Environment,
  Network,
  RecordSource,
  Store,
  FetchFunction,
  QueryResponseCache,
  GraphQLResponse,
  RequestParameters,
  Variables,
  UploadableMap,
  ConcreteRequest,
  OperationType,
  VariablesOf,
} from "relay-runtime";
import { Network as NetworkType } from "relay-runtime/lib/network/RelayNetworkTypes";
import { HTTPError } from "./error";
import { isDefined } from "./func";

const IS_SERVER = typeof window === typeof undefined;
const HOST = process.env.BETA_SPRAY_API_HOST ?? "";
// Enable if you're having a rough time
const CLIENT_DEBUG = false;
const SERVER_DEBUG = false;

export interface QueryResponse {
  params: ConcreteRequest["params"];
  variables: Variables;
  response: GraphQLResponse;
}

export function createEnvironment(): Environment {
  const network = createNetwork();
  const environment = new Environment({
    network,
    store: new Store(new RecordSource(), {}),
    isServer: IS_SERVER,
    log(event) {
      if ((IS_SERVER && SERVER_DEBUG) || (!IS_SERVER && CLIENT_DEBUG)) {
        // eslint-disable-next-line no-console
        console.debug("[relay environment event]", event);
      }
    },
  });

  environment.getNetwork().responseCache = network.responseCache;

  return environment;
}

export function createNetwork(): NetworkType {
  const responseCache = new QueryResponseCache({
    size: 100,
    ttl: 60 * 1000, // 1 minute
  });

  const fetchResponse: FetchFunction = async (
    operation,
    variables,
    cacheConfig,
    uploadables
  ) => {
    // Use cached value if possible, instead of going to the API again
    const forceFetch = cacheConfig?.force;
    const queryID = operation.cacheID;
    if (!forceFetch && queryID && operation.operationKind === "query") {
      const fromCache = responseCache.get(queryID, variables);
      if (isDefined(fromCache)) {
        return Promise.resolve(fromCache);
      }
    }

    return fetchQuery(operation, variables, uploadables);
  };

  const network = Network.create(fetchResponse);
  network.responseCache = responseCache;
  return network;
}

async function fetchQuery(
  operation: RequestParameters,
  variables: Variables,
  uploadables?: UploadableMap | null
): Promise<GraphQLResponse> {
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

  try {
    const response = await fetch(`${HOST}/api/graphql`, request);
    // An HTTP error indicates something went wrong below GQL on the stack,
    // so raise that as an exception
    if (response.status >= 400) {
      throw new HTTPError(response);
    }

    return response.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("API request error", error);
    // Re-throw so this can be caught by useMutation. ErrorBoundary should
    // catch for data queries
    throw error;
  }
}

export async function getPreloadedQuery<TQuery extends OperationType>(
  { params }: ConcreteRequest,
  variables: VariablesOf<TQuery> = {}
): Promise<QueryResponse> {
  const response = await fetchQuery(params, variables);
  return {
    params,
    variables,
    response,
  };
}
