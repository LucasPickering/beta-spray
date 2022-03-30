import React from "react";
import { graphql, useMutation } from "react-relay";
import { Button } from "@mui/material";
import { PhotoCamera as IconPhotoCamera } from "@mui/icons-material";
import { BoulderImageUpload_createImageMutation } from "./__generated__/BoulderImageUpload_createImageMutation.graphql";

interface Props {
  connections: string[];
}

const BoulderImageUpload: React.FC<Props> = ({ connections }) => {
  const [uploadImage] =
    useMutation<BoulderImageUpload_createImageMutation>(graphql`
      mutation BoulderImageUpload_createImageMutation(
        $input: CreateBoulderImageMutationInput!
        $connections: [ID!]!
      ) {
        createImage(input: $input) {
          image
            @appendNode(
              connections: $connections
              edgeTypeName: "BoulderImageNodeEdge"
            ) {
            id
            ...BoulderImageCard_imageNode
          }
        }
      }
    `);

  return (
    <label htmlFor="upload-image-input">
      <input
        accept="image/*"
        id="upload-image-input"
        type="file"
        css={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files) {
            uploadImage({
              variables: {
                input: {
                  imageFile: "boulderImage",
                },
                connections,
              },
              uploadables: {
                boulderImage: e.target.files[0],
              },
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
};

export default BoulderImageUpload;
