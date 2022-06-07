import React, { Suspense } from "react";
import { PreloadedQuery, usePreloadedQuery } from "react-relay";
import { GraphQLTaggedNode, OperationType } from "relay-runtime";

interface Options<Q extends OperationType, P> {
  query: GraphQLTaggedNode;
  dataToProps: (data: Q["response"]) => P | null | undefined;
  fallbackElement: React.ReactElement | null;
  noDataElement?: React.ReactElement | null;
}

interface LoaderProps<Q extends OperationType> {
  queryRef: PreloadedQuery<Q>;
}

interface SuspenseProps<Q extends OperationType> {
  queryRef: PreloadedQuery<Q> | null | undefined;
}

/**
 * Higher-order component to wrap a component with the logic necessary to
 * provide it with GraphQL query data. A parent of this component must load
 * the query, but this HoC will supply the usePreloadedQuery call needed to
 * grab that data and start loading fragments. It will also provide a Suspense
 * layer, so that when the query is undefined/loading, the suspense fallback
 * will be shown.
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
 * @param fallbackElement Element to show while query is loading (via Suspense)
 * @param noDataElement Child to render when needed data is not present
 * @returns Wrapped component
 */
function withQuery<Q extends OperationType, P>({
  query,
  dataToProps,
  fallbackElement,
  noDataElement = null,
}: Options<Q, P>): (Component: React.FC<P>) => React.FC<SuspenseProps<Q>> {
  return (Component) => {
    const baseName = Component.displayName ?? Component.name;

    // We need two separate components here: Loader loads the query data when
    // the query has been executed, Suspense shows loading status when it hasn't.
    // This is two components because hooks can't be optional, we can only do
    // optional logic at the component boundary (when queryRef is null)
    const LoaderComponent: React.FC<LoaderProps<Q>> = ({ queryRef }) => {
      const data = usePreloadedQuery<Q>(query, queryRef);
      const childProps = dataToProps(data);

      if (!childProps) {
        return noDataElement;
      }

      return <Component {...childProps} />;
    };
    LoaderComponent.displayName = `${baseName}Loader`;

    const SuspenseComponent: React.FC<SuspenseProps<Q>> = ({ queryRef }) => (
      <Suspense fallback={fallbackElement}>
        {queryRef && <LoaderComponent queryRef={queryRef} />}
      </Suspense>
    );
    SuspenseComponent.displayName = `${baseName}Suspense`;

    return SuspenseComponent;
  };
}

export default withQuery;
