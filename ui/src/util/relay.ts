import { GetServerSideProps, GetServerSidePropsResult } from "next";
import { ConcreteRequest, Variables, GraphQLResponse } from "relay-runtime";

// TODO comment everything in here

export interface QueryResponse {
  params: ConcreteRequest["params"];
  variables: Variables;
  response: GraphQLResponse;
}

export interface PageQueryResponseProps {
  queryResponses?: Record<string, QueryResponse>;
}

export interface PageQueryRefProps {
  queryRefs?: Record<string, unknown>;
}

export interface RefsToResponses<P extends PageQueryRefProps> {
  queryResponses: {
    [key in keyof P["queryRefs"]]: QueryResponse;
  };
}

export interface ResponsesToRefs<P extends PageQueryResponseProps> {
  queryRefs: {
    [key in keyof P["queryResponses"]]: QueryResponse;
  };
}

export type GetServerSideQueryProps<
  Props extends PageQueryRefProps,
  // Params pulled from the page route (default to none)
  RouteQuery extends Record<string, string | string[]> = Record<string, never>
> = GetServerSideProps<RefsToResponses<Props>, RouteQuery>;

export async function getQueryProps<Props extends PageQueryRefProps>(requests: {
  [key: string]: Promise<QueryResponse>;
}): Promise<GetServerSidePropsResult<RefsToResponses<Props>>> {
  const arrays = Object.entries(requests).reduce<{
    keys: string[];
    requests: Promise<QueryResponse>[];
  }>(
    (acc, [key, request]) => {
      acc.keys.push(key);
      acc.requests.push(request);
      return acc;
    },
    { keys: [], requests: [] }
  );

  const responses = await Promise.all(arrays.requests);
  const queryResponses: Record<string, QueryResponse> = {};
  arrays.keys.forEach((key, i) => {
    queryResponses[key] = responses[i];
  });

  return {
    props: {
      // At this point we need to promise to TS that we mapped all the keys
      queryResponses:
        queryResponses as RefsToResponses<Props>["queryResponses"],
    },
  };
}
