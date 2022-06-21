import React, { useMemo } from "react";
import { NextComponentType, NextPageContext } from "next";
import { useRelayEnvironment } from "react-relay";
import { Environment } from "relay-runtime";
import { QueryResponse } from "util/environment";
import { isDefined } from "util/func";

interface Props {
  Component: NextComponentType<NextPageContext, unknown, unknown>;
  props: PageQueryProps;
}

export interface PageQueryProps {
  queryResponses?: Record<string, QueryResponse>;
}

interface OutputProps {
  queryRefs: Record<string, unknown>;
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
    console.log("Hydrate.queryResponses", queryResponses);
    for (const [queryName, { params, variables, response }] of Object.entries(
      queryResponses
    )) {
      const id = params.cacheID ?? "ass"; // TODO
      environment.getNetwork().responseCache.set(id, variables, response);
      console.log(
        "Hydrate.responseCache",
        environment.getNetwork().responseCache
      );
      // TODO: create using a function exported from react-relay package
      queryRefs[queryName] = {
        environment,
        fetchKey: id,
        fetchPolicy: "store-or-network",
        isDisposed: false,
        name: params.name,
        kind: "PreloadedQuery",
        variables,
      };
    }
  }

  // TODO comment

  return { queryRefs };
}

export default Hydrate;
