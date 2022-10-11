import { Skeleton, Typography, TypographyProps } from "@mui/material";
import React from "react";
import { withQuery } from "relay-query-wrapper";
import { problemQuery } from "../queries";
import { queriesProblemQuery } from "../__generated__/queriesProblemQuery.graphql";
import { graphql, useFragment } from "react-relay";
import { ProblemName_problemNode$key } from "./__generated__/ProblemName_problemNode.graphql";
import Editable from "components/common/Editable";
import useMutation from "util/useMutation";
import { ProblemName_updateProblemMutation } from "./__generated__/ProblemName_updateProblemMutation.graphql";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";

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
        id
        name
      }
    `,
    problemKey
  );

  const { commit: updateProblem, state: updateState } =
    useMutation<ProblemName_updateProblemMutation>(graphql`
      mutation ProblemName_updateProblemMutation(
        $input: UpdateProblemMutationInput!
      ) {
        updateProblem(input: $input) {
          problem {
            id
            name
          }
        }
      }
    `);

  return (
    <>
      <Typography {...typographyProps}>
        <Editable
          value={problem.name}
          onChange={(newValue) => {
            updateProblem({
              variables: { input: { problemId: problem.id, name: newValue } },
              optimisticResponse: {
                updateProblem: {
                  problem: {
                    id: problem.id,
                    name: newValue,
                  },
                },
              },
            });
          }}
        />
      </Typography>

      <MutationErrorSnackbar
        message="Error renaming problem"
        state={updateState}
      />
    </>
  );
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
