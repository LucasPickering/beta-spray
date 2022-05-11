import React from "react";
import { PreloadedQuery, usePreloadedQuery } from "react-relay";
import { GraphQLTaggedNode, OperationType } from "relay-runtime";

interface Options<Q extends OperationType, P> {
  query: GraphQLTaggedNode;
  dataToProps: (data: Q["response"]) => P | null | undefined;
  noDataElement?: React.ReactElement | null;
}

interface Props<Q extends OperationType> {
  queryRef: PreloadedQuery<Q>;
}

/**
 * Higher-order component to wrap a component with the logic necessary to
 * provide it with GraphQL query data. A parent of this component must load
 * the query, but this HoC will supply the usePreloadedQuery call needed to
 * grab that data and start loading fragments.
 *
 * This is a two-stage curried function, meaning a call looks like:
 *
 * ```
 * withQuery({ ...options })(Component)
 * ```
 *
 * @param query GraphQL query definition supplying data
 * @param dataToProps Function to map the query response to the child component's
 *  props. Return null/undefined if data is missing, which will render the
 *  no-data element instead of the child component
 * @param noDataElement Child to render when needed data is not present
 * @returns Wrapped component
 */
function withQuery<Q extends OperationType, P>({
  query,
  dataToProps,
  noDataElement = null,
}: Options<Q, P>): (Component: React.FC<P>) => React.FC<Props<Q>> {
  return (Component) => {
    const WrappedComponent: React.FC<Props<Q>> = ({ queryRef }) => {
      const data = usePreloadedQuery<Q>(query, queryRef);
      const childProps = dataToProps(data);

      if (!childProps) {
        return noDataElement;
      }

      return <Component {...childProps} />;
    };

    WrappedComponent.displayName = `${Component.displayName}Loader`;

    return WrappedComponent;
  };
}

export default withQuery;
