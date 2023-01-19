import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Link,
  Skeleton,
  Typography,
} from "@mui/material";
import { graphql, useFragment } from "react-relay";
import {
  Close as IconClose,
  Delete as IconDelete,
  Done as IconDone,
  Edit as IconEdit,
} from "@mui/icons-material";
import { ProblemCard_problemNode$key } from "./__generated__/ProblemCard_problemNode.graphql";
import LinkBehavior from "components/common/LinkBehavior";
import { isDefined } from "util/func";
import TooltipIconButton from "components/common/TooltipIconButton";
import useForm from "util/useForm";
import TextFormField from "components/common/TextFormField";
import { validateExternalLink } from "util/validator";

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "long" });

interface Props {
  problemKey: ProblemCard_problemNode$key;
  /**
   * Called to save changes to metadata
   */
  onSaveChanges?: (args: {
    problemId: string;
    name: string;
    externalLink: string;
  }) => void;
  /**
   * Called to delete, *after* confirmation dialog
   */
  onDelete?: (problemId: string) => void;
}

const ProblemCard: React.FC<Props> = ({
  problemKey,
  onSaveChanges,
  onDelete,
}) => {
  const problem = useFragment(
    graphql`
      fragment ProblemCard_problemNode on ProblemNode {
        id
        name
        externalLink
        createdAt
        boulder {
          image {
            url
          }
        }
        # We only need one beta, to pre-select it
        betas(first: 1) {
          edges {
            node {
              id
            }
          }
        }
      }
    `,
    problemKey
  );

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

  // Pre-select first beta, if possible
  let linkPath = `/problems/${problem.id}`;
  if (problem.betas.edges.length > 0) {
    linkPath += `/beta/${problem.betas.edges[0].node.id}`;
  }

  return (
    <Card>
      <CardActionArea component={LinkBehavior} href={linkPath}>
        <CardMedia sx={{ height: 200 }}>
          {problem.boulder.image.url ? (
            <img
              src={problem.boulder.image.url}
              alt={`${problem.name} boulder`}
              width="100%"
              height="100%"
              css={{ objectFit: "cover" }}
            />
          ) : (
            // Empty URL indicates this object was optimistically inserted, and
            // we're still waiting on the image URL from the server
            <Skeleton variant="rectangular" width="100%" height="100%" />
          )}
        </CardMedia>
      </CardActionArea>

      <CardContent>
        <Typography variant="h6" component="h3">
          {isDefined(problem.name) ? (
            <TextFormField
              isEditing={isEditing}
              state={nameState}
              placeholder="Problem Name"
            />
          ) : (
            // Missing value indicates it's still loading
            <Skeleton />
          )}
        </Typography>
        <Typography>
          <Link href={externalLinkState.value}>
            {isDefined(problem.externalLink) ? (
              <TextFormField
                isEditing={isEditing}
                state={externalLinkState}
                placeholder="External link (e.g. Mountain Project)"
              />
            ) : (
              // Missing value indicates it's still loading
              <Skeleton />
            )}
          </Link>
        </Typography>
        <Typography variant="subtitle1" component="span" color="text.secondary">
          {dateFormat.format(new Date(problem.createdAt))}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: "end" }}>
        {isEditing ? (
          // Editing state - Cancel and Save buttons
          <>
            <TooltipIconButton title="Discard Changes" onClick={onReset}>
              <IconClose />
            </TooltipIconButton>
            <TooltipIconButton
              title="Save Changes"
              color="primary"
              disabled={hasError}
              onClick={() => {
                setIsEditing(false);
                if (onSaveChanges) {
                  onSaveChanges({
                    problemId: problem.id,
                    name: nameState.value,
                    externalLink: externalLinkState.value,
                  });
                }
              }}
            >
              <IconDone />
            </TooltipIconButton>
          </>
        ) : (
          // "Regular" state - Edit and Delete buttons
          <>
            <TooltipIconButton
              title="Edit Problem Metadata"
              onClick={() => setIsEditing(true)}
            >
              <IconEdit />
            </TooltipIconButton>
            {onDelete && (
              <TooltipIconButton
                title="Delete Problem"
                color="error"
                onClick={() => {
                  if (
                    window.confirm(
                      `Are you sure you want to delete ${problem.name}?`
                    )
                  ) {
                    onDelete(problem.id);
                  }
                }}
              >
                <IconDelete />
              </TooltipIconButton>
            )}
          </>
        )}
      </CardActions>
    </Card>
  );
};

export default ProblemCard;
