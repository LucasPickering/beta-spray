import React from "react";
import { Button } from "@mui/material";
import { PhotoCamera as IconPhotoCamera } from "@mui/icons-material";
import imageCompression from "browser-image-compression";

const maxUploadSizeMB = 1;

interface Props {
  onUpload?: (file: File) => void;
}

const BoulderImageUpload: React.FC<Props> = ({ onUpload }) => (
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
            .catch((error) => {
              // TODO render error to user
              // eslint-disable-next-line no-console
              console.error("Error compressing image", error);
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
);

export default BoulderImageUpload;
