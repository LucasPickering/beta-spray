import { PreloadedQuery, useQueryLoader } from "react-relay";
import queriesCurrentUserQuery from "util/__generated__/queriesCurrentUserQuery.graphql";
import type { queriesCurrentUserQuery as queriesCurrentUserQueryType } from "util/__generated__/queriesCurrentUserQuery.graphql";
import React, { useEffect } from "react";
import { RecordSourceProxy } from "relay-runtime";

interface Props {
  children?: React.ReactNode;
}

interface UserQuery {
  queryRef: PreloadedQuery<queriesCurrentUserQueryType> | null | undefined;
  /**
   * Reload the current user, iff the store shows the user as unauthenticated.
   * This should be called after any mutation, because the server will create
   * a guest user for any mutation.
   * @param store Relay store
   * @returns void
   */
  reloadIfNoUser: (store: RecordSourceProxy) => void;
}

export const UserQueryContext = React.createContext<UserQuery>({} as UserQuery);

/**
 * Context provider for global user-related data. The context holds the
 * currentUser query ref, which can be passed to Relay (using withContextQuery)
 * to get a fragment out.
 */
const UserQueryProvider: React.FC<Props> = ({ children }) => {
  const [currentUserQueryRef, loadCurrentUserQuery] =
    useQueryLoader<queriesCurrentUserQueryType>(queriesCurrentUserQuery);

  useEffect(() => {
    loadCurrentUserQuery({});
  }, [loadCurrentUserQuery]);

  return (
    <UserQueryContext.Provider
      value={{
        queryRef: currentUserQueryRef,
        reloadIfNoUser: (store) => {
          const currentUser = store.getRoot().getLinkedRecord("currentUser");
          if (currentUser?.getValue("__typename") === "NoUser") {
            // Force a reload since we know the data may have changed
            loadCurrentUserQuery({}, { fetchPolicy: "network-only" });
          }
        },
      }}
    >
      {children}
    </UserQueryContext.Provider>
  );
};

export default UserQueryProvider;
