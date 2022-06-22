import React, { useMemo } from "react";
import { useRelayEnvironment } from "react-relay";
import { Environment } from "relay-runtime";
import { isDefined } from "util/func";
import { NextPageExtended } from "pages/_app";
import {
  PageQueryRefProps,
  PageQueryResponseProps,
  ResponsesToRefs,
} from "util/relay";

interface Props {
  Component: NextPageExtended<PageQueryRefProps>;
  props: PageQueryResponseProps;
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

function transformProps<P extends PageQueryResponseProps>(
  environment: Environment,
  props: P | undefined
): ResponsesToRefs<P> {
  const queryResponses = props?.queryResponses;
  const queryRefs: PageQueryRefProps["queryRefs"] = {};

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

  return { queryRefs: queryRefs as ResponsesToRefs<P>["queryRefs"] };
}

export default Hydrate;
