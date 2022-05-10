import React, { useState } from "react";
import { Button } from "@mui/material";
import { PhotoCamera as IconPhotoCamera } from "@mui/icons-material";
import imageCompression from "browser-image-compression";
import ErrorSnackbar from "components/common/ErrorSnackbar";

const maxUploadSizeMB = 1;

interface Props {
  onUpload?: (file: File) => void;
}

const BoulderImageUpload: React.FC<Props> = ({ onUpload }) => {
  const [error, setError] = useState<Error | undefined>();

  return (
    <>
      <label htmlFor="upload-image-input">
        <input
          accept="image/*"
          id="upload-image-input"
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
        <Button
          variant="contained"
          component="span"
          endIcon={<IconPhotoCamera />}
          css={{ width: "100%" }}
        >
          Upload
        </Button>
      </label>

      <ErrorSnackbar
        summary="An error occurred while compressing image"
        error={error}
      />
    </>
  );
};

export default BoulderImageUpload;
