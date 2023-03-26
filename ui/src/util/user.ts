/**
 * Utilities related to user management. These are useful for accessing the
 * current user.
 */

import React, { useContext } from "react";
import { PreloadedQuery, useFragment, usePreloadedQuery } from "react-relay";
import {
  RecordSourceProxy,
  generateUniqueClientID,
  graphql,
} from "relay-runtime";
import type { queriesCurrentUserQuery as queriesCurrentUserQueryType } from "util/__generated__/queriesCurrentUserQuery.graphql";
import { currentUserQuery } from "./queries";
import { userUseOptimisiticUserFields_userNode$key } from "./__generated__/userUseOptimisiticUserFields_userNode.graphql";
import { useLocation } from "react-router-dom";

interface UserQuery {
  queryRef: PreloadedQuery<queriesCurrentUserQueryType>;
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
 * Generate `owner` and `permissions` fields for an optimistic response. We have
 * several types/mutations that get these in a response, and they're generally
 * tedious but easy to figure out based on the current user context. This hook
 * can be used to dump those two fields into any optimistic response.
 */
export function useOptimisiticUserFields(): {
  owner: {
    id: string;
    username: string;
    isCurrentUser: boolean;
    isGuest: boolean;
  };
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
  };
} {
  const { queryRef } = useContext(UserQueryContext);
  // Unpack the data from the query ref, then into a fragment
  const data = usePreloadedQuery(currentUserQuery, queryRef);
  const currentUser = useFragment<userUseOptimisiticUserFields_userNode$key>(
    graphql`
      fragment userUseOptimisiticUserFields_userNode on UserNodeNoUser {
        __typename
        ... on UserNode {
          id
          username
          isCurrentUser
          isGuest
        }
      }
    `,
    data.currentUser
  );
  return {
    // We know we'll be the owner. If we're already logged in, then it's easy. If
    // not though, we anticipate the API will create a guest user for us.
    owner:
      currentUser.__typename === "UserNode"
        ? currentUser
        : {
            id: generateUniqueClientID(),
            username: "",
            isCurrentUser: true,
            isGuest: true,
          },
    // We'll be the owner, so we have full permissions
    permissions: { canEdit: true, canDelete: true },
  };
}

/**
 * Get a path for links to the login page. This will include a query param on
 * the path to make sure we return to the current page after login
 */
export function useLoginPath(): string {
  const location = useLocation();
  // Maintain path+query+hash. We can't retain router state since that's in-memory only.
  // This doesn't seem to work entirely in firefox because it preemptively
  // decodes the URL in the link.
  // TODO fix in firefox
  const next = encodeURIComponent(
    location.pathname + location.search + location.hash
  );
  return `/login?next=${next}`;
}
