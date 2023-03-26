import { useQueryLoader } from "react-relay";
import queriesCurrentUserQuery from "util/__generated__/queriesCurrentUserQuery.graphql";
import type { queriesCurrentUserQuery as queriesCurrentUserQueryType } from "util/__generated__/queriesCurrentUserQuery.graphql";
import React, { useEffect } from "react";
import { isDefined } from "util/func";
import { UserQueryContext } from "util/user";

interface Props {
  children?: React.ReactNode;
}

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

  // The query ref is only null until the query is launched, which should be
  // immediate. So we'll end up blocking the entire UI for one render, which is
  // kinda shit but I don't see any other solution. There are lots of places in
  // the component tree that will break if we don't have the query ref.
  if (!isDefined(currentUserQueryRef)) {
    return null;
  }

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
