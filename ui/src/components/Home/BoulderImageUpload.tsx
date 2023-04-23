import { useId, useState } from "react";
import { Card, CardActionArea, CardContent, Typography } from "@mui/material";
import { Upload as IconUpload } from "@mui/icons-material";
import imageCompression from "browser-image-compression";
import ErrorSnackbar from "components/common/ErrorSnackbar";
import useMutation from "util/useMutation";
import { BoulderImageUpload_createBoulderWithFriendsMutation } from "./__generated__/BoulderImageUpload_createBoulderWithFriendsMutation.graphql";
import { graphql } from "relay-runtime";
import { useNavigate } from "react-router-dom";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import MutationLoadingBackdrop from "components/common/MutationLoadingBackdrop";

const maxUploadSizeMB = 0.2; // 200 KB

const BoulderImageUpload: React.FC = () => {
  const [error, setError] = useState<Error | undefined>();
  const inputId = useId();

  // For now, we enforce one problem per image, so auto-create the problem now
  const { commit: createBoulderWithFriends, state: createState } =
    useMutation<BoulderImageUpload_createBoulderWithFriendsMutation>(graphql`
      mutation BoulderImageUpload_createBoulderWithFriendsMutation(
        $input: CreateBoulderWithFriendsInput!
      ) {
        createBoulderWithFriends(input: $input) {
          id # This is the created *beta* id
          # Don't bother adding this to any connections, those will get refetched anyway
          problem {
            id
            ...ProblemCard_problemNode
          }
        }
      }
    `);

  const navigate = useNavigate();

  return (
    <Card>
      <label htmlFor={inputId}>
        <input
          accept="image/*"
          id={inputId}
          type="file"
          css={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              // Compress now to get around max API size and reduce network load
              imageCompression(file, {
                maxSizeMB: maxUploadSizeMB,
              })
                .then((compressedFile) => {
                  createBoulderWithFriends({
                    variables: {
                      // null is a placeholder for the file data, which will be
                      // pulled from the request body and injected by the API
                      input: { image: null },
                    },
                    uploadables: {
                      // This has to match the variable path above
                      ["input.image"]: compressedFile,
                    },

                    // No optimistic response here, since the Editor page will
                    // need to refetch anyway and the home page refetches on load

                    // Redirect to the newly uploaded problem
                    onCompleted(data) {
                      // This shouldn't ever be null if the mutation succeeded
                      if (data.createBoulderWithFriends) {
                        const { id: betaId, problem } =
                          data.createBoulderWithFriends;
                        // Pre-select the created beta, to avoid waterfalled requests
                        navigate(`/problems/${problem.id}/beta/${betaId}`);
                      }
                    },
                  });
                })
                // Async errors aren't caught by error boundaries, so we need to
                // handle this one manually
                .catch((error: Error) => {
                  setError(error);
                });
            }
          }}
        />
        {/* Action "button" has to go *inside* the upload label */}
        <CardActionArea component="span">
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <IconUpload sx={{ fontSize: 120 }} />
            <Typography variant="h6" component="span">
              New Problem
            </Typography>
            <Typography variant="subtitle2">
              Upload a photo of a problem to share new beta
            </Typography>
          </CardContent>
        </CardActionArea>
      </label>

      <ErrorSnackbar summary="Error compressing image" error={error} />

      <MutationLoadingBackdrop
        mutationState={createState}
        message="Uploading problem…"
      />
      <MutationErrorSnackbar
        message="Error uploading problem"
        state={createState}
      />
    </Card>
  );
};

export default BoulderImageUpload;
