import { queriesProblemQuery } from "util/__generated__/queriesProblemQuery.graphql";
import useMutation from "util/useMutation";
import { formatDate } from "util/format";
import {
  Box,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Skeleton,
  Typography,
  TypographyProps,
} from "@mui/material";
import { withQuery } from "relay-query-wrapper";
import { graphql, useFragment } from "react-relay";
import ExternalProblemLink from "components/common/ExternalProblemLink";
import {
  Delete as IconDelete,
  Settings as IconSettings,
} from "@mui/icons-material";
import { useState } from "react";
import ActionsMenu from "components/common/ActionsMenu";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import { useNavigate } from "react-router-dom";
import MutationLoadingBackdrop from "components/common/MutationLoadingBackdrop";
import Username from "components/Account/Username";
import DisabledTooltip from "components/common/DisabledTooltip";
import { problemQuery } from "../../../util/queries";
import { ProblemMetadata_deleteProblemMutation } from "./__generated__/ProblemMetadata_deleteProblemMutation.graphql";
import ProblemSettings from "./ProblemSettings";
import { ProblemMetadata_problemNode$key } from "./__generated__/ProblemMetadata_problemNode.graphql";

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
        ...ProblemSettings_problemNode
        id
        name
        externalLink
        createdAt
        permissions {
          canEdit
          canDelete
        }
        owner {
          ...Username_userNode
        }
      }
    `,
    problemKey
  );

  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { commit: deleteProblem, state: deleteState } =
    useMutation<ProblemMetadata_deleteProblemMutation>(graphql`
      mutation ProblemMetadata_deleteProblemMutation($input: NodeInput!) {
        deleteProblem(input: $input) {
          id @deleteRecord
        }
      }
    `);

  const onDelete = (): void => {
    if (window.confirm(`Are you sure you want to delete ${problem.name}?`)) {
      deleteProblem({
        variables: { input: { id: problem.id } },
        // Intentionally exclude optimistic response - we don't want
        // to show the problem as deleted until it really is
        onCompleted(data) {
          if (data) {
            navigate("/");
          }
        },
        updater(store) {
          // TODO figure out if we can get rid of this (right now it crashes)
          // @deleteEdge *might* work but we'd need to collect all collection
          // keys which is a PITA
          store.invalidateStore();
        },
      });
    }
  };

  return (
    <>
      <Box>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="start"
        >
          <Typography {...nameTypographyProps}>{problem.name}</Typography>

          <ActionsMenu title="Problem Actions">
            <DisabledTooltip
              title="You don't have permission to edit this problem"
              placement="left"
            >
              <MenuItem
                disabled={!problem.permissions.canEdit}
                onClick={() => setIsSettingsOpen(true)}
              >
                <ListItemIcon>
                  <IconSettings />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </MenuItem>
            </DisabledTooltip>
            <DisabledTooltip
              title="You don't have permission to delete this problem"
              placement="left"
            >
              <MenuItem
                disabled={!problem.permissions.canDelete}
                onClick={onDelete}
                sx={({ palette }) => ({ color: palette.error.main })}
              >
                <ListItemIcon>
                  <IconDelete />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            </DisabledTooltip>
          </ActionsMenu>
        </Box>

        <ExternalProblemLink>{problem.externalLink}</ExternalProblemLink>

        <Typography>
          <Username userKey={problem.owner} />
        </Typography>

        <Typography>{formatDate(problem.createdAt)}</Typography>
      </Box>

      <ProblemSettings
        problemKey={problem}
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <MutationLoadingBackdrop
        mutationState={deleteState}
        message="Deleting problem…"
      />
      <MutationErrorSnackbar
        message="Error deleting problem"
        state={deleteState}
      />
    </>
  );
};

export default withQuery<queriesProblemQuery, Props>({
  query: problemQuery,
  dataToProps: (data) => data.problem && { problemKey: data.problem },
  fallbackElement: (
    <>
      {/* Problem name */}
      <Typography {...nameTypographyProps}>
        <Skeleton />
      </Typography>
      {/* Uploader */}
      <Typography>
        <Skeleton />
      </Typography>
    </>
  ),
})(ProblemMetadata);
