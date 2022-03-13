import React from "react";
import { graphql, useMutation } from "react-relay";
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
    <input
      type="file"
      accept="image/png, image/jpeg"
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
  );
};

export default BoulderImageUpload;
