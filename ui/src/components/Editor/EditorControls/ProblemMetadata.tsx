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
import { problemQuery } from "../queries";
import { queriesProblemQuery } from "../__generated__/queriesProblemQuery.graphql";
import { graphql, useFragment } from "react-relay";
import { ProblemMetadata_problemNode$key } from "./__generated__/ProblemMetadata_problemNode.graphql";
import ExternalProblemLink from "components/common/ExternalProblemLink";
import { Settings as IconSettings } from "@mui/icons-material";
import ProblemSettings from "./ProblemSettings";
import { useState } from "react";
import ActionsMenu from "components/common/ActionsMenu";

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
        owner {
          username
        }
      }
    `,
    problemKey
  );

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
            <MenuItem onClick={() => setIsSettingsOpen(true)}>
              <ListItemIcon>
                <IconSettings />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
          </ActionsMenu>
        </Box>

        <ExternalProblemLink>{problem.externalLink}</ExternalProblemLink>

        <Typography>Uploaded by {problem.owner.username}</Typography>
      </Box>

      <ProblemSettings
        problemKey={problem}
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
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
