import { Skeleton, Typography, TypographyProps } from "@mui/material";
import React from "react";
import withQuery from "util/withQuery";
import { problemQuery } from "../queries";
import { queriesProblemQuery } from "../__generated__/queriesProblemQuery.graphql";
import { graphql, useFragment } from "react-relay";
import { ProblemName_problemNode$key } from "./__generated__/ProblemName_problemNode.graphql";

interface Props {
  problemKey: ProblemName_problemNode$key;
}

const typographyProps: TypographyProps = {
  variant: "h5",
  // Overriding `component` doesn't work with the way we've done the types here,
  // so this makes it render as an <h1>, which is appropriate because this is
  // the primary title of the page.
  variantMapping: { h5: "h1" },
};

/**
 * The title of the current problem
 */
const ProblemName: React.FC<Props> = ({ problemKey }) => {
  const problem = useFragment(
    graphql`
      fragment ProblemName_problemNode on ProblemNode {
        name
      }
    `,
    problemKey
  );

  return <Typography {...typographyProps}>{problem.name}</Typography>;
};

export default withQuery<queriesProblemQuery, Props>({
  query: problemQuery,
  dataToProps: (data) => data.problem && { problemKey: data.problem },
  fallbackElement: (
    <Typography {...typographyProps}>
      <Skeleton />
    </Typography>
  ),
})(ProblemName);
