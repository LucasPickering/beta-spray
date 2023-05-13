import { useId, useState } from "react";
import { Card, CardActionArea, CardContent, Typography } from "@mui/material";
import { Upload as IconUpload } from "@mui/icons-material";
import imageCompression from "browser-image-compression";
import ErrorSnackbar from "components/common/ErrorSnackbar";
import useMutation from "util/useMutation";
import { BoulderImageUpload_createBoulderWithFriendsMutation } from "./__generated__/BoulderImageUpload_createBoulderWithFriendsMutation.graphql";
import { graphql } from "relay-runtime";
import { useNavigate } from "react-router-dom";
import useForm from "util/useForm";
import { optional, validateName } from "util/validator";
import FormDialog from "components/common/FormDialog";
import TextFormField from "components/common/TextFormField";
import { assertIsDefined, isDefined } from "util/func";
import { formatFileSize } from "util/format";

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

  // After user picks a file, we'll store it in memory while they fill out the
  // upload form.
  const [file, setFile] = useState<File | undefined>();
  const formState = useForm({
    name: { initialValue: "", validator: optional(validateName) },
  });

  const upload = (): void => {
    // This function shouldn't be callable if file isn't present
    assertIsDefined(file);

    createBoulderWithFriends({
      variables: {
        // null is a placeholder for the file data, which will be
        // pulled from the request body and injected by the API
        input: {
          image: null,
          // If name is blank, pass null to get a random one from the server
          problemName: formState.fieldStates.name.value || undefined,
        },
      },
      uploadables: {
        // This has to match the variable path above
        ["input.image"]: file,
      },

      // No optimistic response here, since the Editor page will
      // need to refetch anyway and the home page refetches on load

      // Redirect to the newly uploaded problem
      onCompleted(data) {
        // This shouldn't ever be null if the mutation succeeded
        if (data.createBoulderWithFriends) {
          setFile(undefined);
          const { id: betaId, problem } = data.createBoulderWithFriends;
          // Pre-select the created beta, to avoid waterfalled requests
          navigate(`/problems/${problem.id}/beta/${betaId}`);
        }
      },
    });
  };

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
                // Store the file while the user fills out the form
                .then((compressedFile) => setFile(compressedFile))
                // Async errors aren't caught by error boundaries, so we need to
                // handle this one manually
                .catch((error: Error) => setError(error));
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

      {/* A dialog for the user to fill in some settings *before• upload */}
      <FormDialog
        title={
          "Upload Problem" +
          (isDefined(file) ? ` (${formatFileSize(file)})` : "")
        }
        open={isDefined(file)}
        mutationState={createState}
        formState={formState}
        assumeHasChanges
        cancelWarningMessage="Cancel upload?"
        errorMessage="Error uploading problem"
        componentProps={{
          saveButton: {
            startIcon: <IconUpload />,
            children: "Upload",
          },
        }}
        onSave={upload}
        onClose={() => setFile(undefined)}
      >
        <TextFormField
          label="Problem Name"
          state={formState.fieldStates.name}
          helperText="Leave blank for a random name. You can change this later in the problem settings."
        />
      </FormDialog>

      <ErrorSnackbar summary="Error compressing image" error={error} />
    </Card>
  );
};

export default BoulderImageUpload;
