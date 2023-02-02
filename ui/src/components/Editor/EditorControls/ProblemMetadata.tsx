import { Box, Skeleton, Typography, TypographyProps } from "@mui/material";
import { withQuery } from "relay-query-wrapper";
import { problemQuery } from "../queries";
import { queriesProblemQuery } from "../__generated__/queriesProblemQuery.graphql";
import { graphql, useFragment } from "react-relay";
import { ProblemMetadata_problemNode$key } from "./__generated__/ProblemMetadata_problemNode.graphql";
import useMutation from "util/useMutation";
import { ProblemMetadata_updateProblemMutation } from "./__generated__/ProblemMetadata_updateProblemMutation.graphql";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import { validateExternalLink } from "util/validator";
import ExternalProblemLink from "components/common/ExternalProblemLink";
import Editable from "components/common/Editable";

interface Props {
  problemKey: ProblemMetadata_problemNode$key;
}

const nameTypographyProps: TypographyProps = {
  variant: "h5",
  // Overriding `component` doesn't work with the way we've done the types here,
  // so this makes it render as an <h1>, which is appropriate because this is
  // the primary title of the page.
  variantMapping: { h5: "h1" },
};

/**
 * Name and other metadata for a problem, plus controls to edit those fields.
 */
const ProblemMetadata: React.FC<Props> = ({ problemKey }) => {
  const problem = useFragment(
    graphql`
      fragment ProblemMetadata_problemNode on ProblemNode {
        id
        name
        externalLink
      }
    `,
    problemKey
  );

  const { commit: updateProblem, state: updateState } =
    useMutation<ProblemMetadata_updateProblemMutation>(graphql`
      mutation ProblemMetadata_updateProblemMutation(
        $input: UpdateProblemMutationInput!
      ) {
        updateProblem(input: $input) {
          problem {
            id
            name
            externalLink
          }
        }
      }
    `);

  const onChange = ({
    name,
    externalLink,
  }: {
    name?: string;
    externalLink?: string;
  }): void => {
    updateProblem({
      variables: {
        input: {
          problemId: problem.id,
          name,
          externalLink,
        },
      },
      optimisticResponse: {
        updateProblem: {
          problem: {
            id: problem.id,
            name: name ?? problem.name,
            externalLink: externalLink ?? problem.externalLink,
          },
        },
      },
    });
  };

  return (
    <>
      <Box>
        <Typography {...nameTypographyProps}>
          <Editable
            value={problem.name}
            placeholder="Problem Name"
            onChange={(newValue) => onChange({ name: newValue })}
          />
        </Typography>

        <Editable
          value={problem.externalLink}
          placeholder="External Link"
          validator={validateExternalLink}
          onChange={(newValue) => onChange({ externalLink: newValue })}
        >
          <ExternalProblemLink />
        </Editable>
      </Box>

      <MutationErrorSnackbar
        message="Error updating problem"
        state={updateState}
      />
    </>
  );
};

export default withQuery<queriesProblemQuery, Props>({
  query: problemQuery,
  dataToProps: (data) => data.problem && { problemKey: data.problem },
  fallbackElement: (
    <Typography {...nameTypographyProps}>
      <Skeleton />
    </Typography>
  ),
})(ProblemMetadata);
