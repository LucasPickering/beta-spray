import { Helmet } from "react-helmet-async";
import { graphql, useFragment } from "react-relay";
import { withQuery } from "relay-query-wrapper";
import { problemQuery } from "./queries";
import { EditorHelmet_problemNode$key } from "./__generated__/EditorHelmet_problemNode.graphql";
import { queriesProblemQuery } from "./__generated__/queriesProblemQuery.graphql";

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

export default withQuery<queriesProblemQuery, Props>({
  query: problemQuery,
  dataToProps: (data) => data.problem && { problemKey: data.problem },
  // This component doesn't render anything visible
  fallbackElement: null,
})(EditorHelmet);
