import React, { useMemo } from "react";
import { useRelayEnvironment } from "react-relay";
import { Environment } from "relay-runtime";
import { QueryResponse } from "util/environment";
import { isDefined } from "util/func";
import { NextPageExtended } from "pages/_app";

interface Props {
  Component: NextPageExtended<unknown>;
  props: PageQueryProps;
}

export interface PageQueryProps {
  queryResponses?: Record<string, QueryResponse>;
}

interface OutputProps {
  queryRefs?: Record<string, unknown>;
}

// TODO comment
// TODO fix typing
const Hydrate: React.FC<Props> = ({ Component, props }) => {
  const environment = useRelayEnvironment();

  const transformedProps = useMemo(
    () => transformProps(environment, props),
    [environment, props]
  );

  return <Component {...transformedProps} />;
};

function transformProps(
  environment: Environment,
  props: PageQueryProps | undefined
): OutputProps {
  const queryResponses = props?.queryResponses;
  const queryRefs: OutputProps["queryRefs"] = {};

  // Map query responses to the format that relay uses
  // This duplicates logic from useQueryLoader
  if (isDefined(queryResponses)) {
    for (const [queryName, { params, variables, response }] of Object.entries(
      queryResponses
    )) {
      const queryID = params.cacheID;
      if (queryID) {
        environment
          .getNetwork()
          .responseCache.set(queryID, variables, response);

        // TODO: create using a function exported from react-relay package
        queryRefs[queryName] = {
          environment,
          fetchKey: queryID,
          fetchPolicy: "store-or-network",
          isDisposed: false,
          name: params.name,
          kind: "PreloadedQuery",
          variables,
        };
      }
    }
  }

  // TODO comment

  return { queryRefs };
}

export default Hydrate;
