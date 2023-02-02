import { useId, useState } from "react";
import { Card, CardActionArea, CardContent, Typography } from "@mui/material";
import { Upload as IconUpload } from "@mui/icons-material";
import imageCompression from "browser-image-compression";
import ErrorSnackbar from "components/common/ErrorSnackbar";

const maxUploadSizeMB = 0.2; // 200 KB

interface Props {
  onUpload?: (file: File) => void;
}

const BoulderImageUpload: React.FC<Props> = ({ onUpload }) => {
  const [error, setError] = useState<Error | undefined>();
  const inputId = useId();

  // Use height:100% everywhere so we match the other cards in the problem list
  return (
    <Card sx={{ height: "100%" }}>
      <label htmlFor="upload-image-input">
        <input
          accept="image/*"
          id={inputId}
          type="file"
          css={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (onUpload && file) {
              // Compress now to get around max API size and reduce network load
              imageCompression(file, {
                maxSizeMB: maxUploadSizeMB,
              })
                .then((compressedFile) => {
                  onUpload(compressedFile);
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
        <CardActionArea component="span" sx={{ height: "100%" }}>
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
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

      <ErrorSnackbar
        summary="An error occurred while compressing image"
        error={error}
      />
    </Card>
  );
};

export default BoulderImageUpload;
