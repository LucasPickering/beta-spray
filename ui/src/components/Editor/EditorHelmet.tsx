import React from "react";
import { Helmet } from "react-helmet-async";
import { graphql, useFragment } from "react-relay";
import withQuery from "util/withQuery";
import { editorQuery } from "./queries";
import { EditorHelmet_problemNode$key } from "./__generated__/EditorHelmet_problemNode.graphql";
import { queriesEditorQuery } from "./__generated__/queriesEditorQuery.graphql";

interface Props {
  problemKey: EditorHelmet_problemNode$key;
}

/**
 * Invisible element to update HTML head tag for the editor
 */
const EditorHelmet: React.FC<Props> = ({ problemKey }) => {
  const problem = useFragment(
    graphql`
      fragment EditorHelmet_problemNode on ProblemNode {
        name
        boulder {
          image {
            url
          }
        }
      }
    `,
    problemKey
  );

  return (
    <Helmet>
      <title>{problem.name} | Beta Spray</title>
      <meta property="og:image" content={problem.boulder.image.url} />
    </Helmet>
  );
};

export default withQuery<queriesEditorQuery, Props>({
  query: editorQuery,
  dataToProps: (data) => data.problem && { problemKey: data.problem },
  // This component doesn't render anything visible
  fallbackElement: null,
})(EditorHelmet);
