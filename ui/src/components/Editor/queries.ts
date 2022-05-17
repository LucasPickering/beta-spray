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

/**
 * Main query that drives the editor
 *
 * TODO break this into two queries
 */
export const editorQuery = graphql`
  query queriesEditorQuery($problemId: ID!, $betaId: ID!) {
    problem(id: $problemId) {
      ...EditorHelmet_problemNode
      ...EditorSvg_problemNode
      ...BetaList_problemNode
    }

    beta(id: $betaId) {
      ...BetaDetails_betaNode
      ...EditorSvg_betaNode
    }
  }
`;
