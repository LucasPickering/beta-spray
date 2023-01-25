import {
  Box,
  Button,
  Skeleton,
  Stack,
  Typography,
  TypographyProps,
} from "@mui/material";
import { withQuery } from "relay-query-wrapper";
import { problemQuery } from "../queries";
import { queriesProblemQuery } from "../__generated__/queriesProblemQuery.graphql";
import { graphql, useFragment } from "react-relay";
import { ProblemMetadata_problemNode$key } from "./__generated__/ProblemMetadata_problemNode.graphql";
import useMutation from "util/useMutation";
import { ProblemMetadata_updateProblemMutation } from "./__generated__/ProblemMetadata_updateProblemMutation.graphql";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import useForm from "util/useForm";
import TextFormField from "components/common/TextFormField";
import {
  Clear as IconClear,
  Edit as IconEdit,
  Save as IconSave,
} from "@mui/icons-material";
import { validateExternalLink } from "util/validator";
import ExternalProblemLink from "components/common/ExternalProblemLink";

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

  const {
    isEditing,
    setIsEditing,
    hasError,
    fieldState: { name: nameState, externalLink: externalLinkState },
    onReset,
  } = useForm({
    name: { initialValue: problem.name },
    externalLink: {
      initialValue: problem.externalLink,
      validator: validateExternalLink,
    },
  });

  return (
    <>
      <Box>
        <TextFormField
          isEditing={isEditing}
          state={nameState}
          placeholder="Problem Name"
        >
          <Typography {...nameTypographyProps} />
        </TextFormField>

        <TextFormField
          isEditing={isEditing}
          state={externalLinkState}
          placeholder="External link"
        >
          <ExternalProblemLink />
        </TextFormField>
      </Box>

      {isEditing ? (
        <Stack
          direction="row"
          spacing={1}
          width="100%"
          // Size children evenly
          sx={{ "& > *": { flex: "1 1" } }}
        >
          <Button size="small" startIcon={<IconClear />} onClick={onReset}>
            Cancel
          </Button>
          <Button
            disabled={hasError}
            size="small"
            startIcon={<IconSave />}
            onClick={() => {
              setIsEditing(false);
              updateProblem({
                variables: {
                  input: {
                    problemId: problem.id,
                    name: nameState.value,
                    externalLink: externalLinkState.value,
                  },
                },
                optimisticResponse: {
                  updateProblem: {
                    problem: {
                      id: problem.id,
                      name: nameState.value,
                      externalLink: externalLinkState.value,
                    },
                  },
                },
              });
            }}
          >
            Save
          </Button>
        </Stack>
      ) : (
        <Button
          size="small"
          startIcon={<IconEdit />}
          onClick={() => setIsEditing(true)}
        >
          Edit
        </Button>
      )}

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
    <Typography {...nameTypographyProps}>
      <Skeleton />
    </Typography>
  ),
})(ProblemMetadata);
