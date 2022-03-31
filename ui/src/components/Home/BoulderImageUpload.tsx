import React from "react";
import { Button } from "@mui/material";
import { PhotoCamera as IconPhotoCamera } from "@mui/icons-material";

interface Props {
  onUpload?: (files: FileList) => void;
}

const BoulderImageUpload: React.FC<Props> = ({ onUpload }) => (
  <label htmlFor="upload-image-input">
    <input
      accept="image/*"
      id="upload-image-input"
      type="file"
      css={{ display: "none" }}
      onChange={(e) => {
        if (onUpload && e.target.files) {
          onUpload(e.target.files);
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
