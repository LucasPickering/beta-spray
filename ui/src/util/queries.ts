/**
 * This file defines all the GraphQL queries that we make throughout the editor
 * page. Normally queries are only defined in components because each query has
 * one corresponding usePreloadedQuery, but the complicated nature of this page
 * requires us to have multiple queries that each get consumed in multiple
 * places.
 *
 * The alternative is to have one monolithic queries that blocks all page
 * rendering, which is really shitty for UX.
 *
 * @module
 */

import { graphql } from "react-relay";

export const currentUserQuery = graphql`
  query queriesCurrentUserQuery {
    currentUser {
      ...AccountMenu_currentUser
      ...LogInPage_currentUser
      ...GuestUserWarningDialog_currentUser
      ...userUseOptimisiticUserFields_currentUser
    }
  }
`;

/**
 * Query for a single boulder problem
 */
export const problemQuery = graphql`
  query queriesProblemQuery($problemId: ID!) {
    problem(id: $problemId) {
      ...BetaList_problemNode
      ...EditorHelmet_problemNode
      ...EditorSvg_problemNode
      ...HoldEditorModeButton_problemNode
      ...ProblemMetadata_problemNode
    }
  }
`;

/**
 * Query for a specific beta. This should belong to the boulder problem being
 * shown in the editor, but that's not enforced here.
 */
export const betaQuery = graphql`
  query queriesBetaQuery($betaId: ID!) {
    beta(id: $betaId) {
      ...BetaDetails_betaNode
      ...BetaEditor_betaNode
      ...BetaMoveEditorModeButton_betaNode
      ...PlayPauseControls_betaNode
    }
  }
`;
