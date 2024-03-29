import { UserQueryContext } from "util/user";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  // eslint-disable-next-line no-restricted-syntax
  useMutation as useMutationRelay,
  UseMutationConfig,
} from "react-relay";
import {
  Disposable,
  GraphQLTaggedNode,
  IEnvironment,
  MutationConfig,
  MutationParameters,
  PayloadError,
} from "relay-runtime";

type MutationStateData =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success" }
  | {
      // Include two subvariants. This makes it easy to check for a general
      // "error" case, but also get more detailed information on the exact
      // error when needed.
      status: "error";
      error:
        | {
            kind: "graphql";
            data: PayloadError[];
          }
        | { kind: "network"; data: Error };
    };

/**
 * The possible states of a mutation. Tracking error data is important for
 * debugging, which is why it's so detailed. We group all this into one object
 * so consumers can easily pass it from this hook to components to be displayed
 * (e.g. a common component for rendering errors). Also includes a callback
 * to reset the state.
 */
export type MutationState = MutationStateData & { reset: () => void };

/**
 * A wrapper around Relay's useMutation. Takes the same inputs, but has
 * expanded output to get more granular tracking of the mutation's state.
 * The status will reflect the most recent call to the mutation.
 */
function useMutation<TMutation extends MutationParameters>(
  mutation: GraphQLTaggedNode,
  commitMutationFn?: (
    environment: IEnvironment,
    config: MutationConfig<TMutation>
  ) => Disposable
): {
  commit: (config: UseMutationConfig<TMutation>) => Disposable;
  state: MutationState;
} {
  const [commit, isInFlight] = useMutationRelay(mutation, commitMutationFn);
  const [state, setState] = useState<MutationStateData>({
    status: "idle",
  });
  const { reloadIfNoUser: reloadUserQuery } = useContext(UserQueryContext);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  useEffect(() => {
    if (isInFlight) {
      setState({ status: "loading" });
    }
  }, [isInFlight]);

  return {
    commit: ({ updater, onCompleted, onError, ...rest }) =>
      commit({
        updater(store, mutation) {
          // If we aren't logged in yet, we expect the API to create a guest
          // user during this mutation. So reload the user
          reloadUserQuery(store);
          updater?.(store, mutation);
        },
        // Track success and error status
        onCompleted(response, errors) {
          // GQL errors will show up here
          if (errors) {
            setState({
              status: "error",
              error: { kind: "graphql", data: errors },
            });
          } else {
            setState({ status: "success" });
          }
          onCompleted?.(response, errors);
        },
        onError(error) {
          // Error talking to the API
          setState({
            status: "error",
            error: { kind: "network", data: error },
          });
          if (onError) {
            onError(error);
          }
        },
        ...rest,
      }),
    state: { reset, ...state },
  };
}

export default useMutation;
