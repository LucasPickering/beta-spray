import React from "react";
import { graphql, useMutation } from "react-relay";
import { Button } from "@mui/material";
import { PhotoCamera as IconPhotoCamera } from "@mui/icons-material";
import { BoulderImageUpload_createProblemMutation } from "./__generated__/BoulderImageUpload_createProblemMutation.graphql";
import { randomPhrase } from "util/func";

interface Props {
  connections: string[];
}

const problemPhraseGroups = [
  ["Up Up", "Monster", "Slab", "Crack", "Lateral"],
  ["Up", "And Away", "Sauce", "Joy", "Wolves", "Psoriasis"],
  // repetition => weighted odds
  [undefined, undefined, undefined, "2.0", "But Harder"],
];

const BoulderImageUpload: React.FC<Props> = ({ connections }) => {
  // For now, we enforce one problem per image, so auto-create the problem now
  const [createProblem] =
    useMutation<BoulderImageUpload_createProblemMutation>(graphql`
      mutation BoulderImageUpload_createProblemMutation(
        $input: CreateProblemMutationInput!
        $connections: [ID!]!
      ) {
        createProblem(input: $input) {
          problem
            @appendNode(
              connections: $connections
              edgeTypeName: "ProblemNodeEdge"
            ) {
            id
            name
            ...ProblemCard_problemNode
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
            createProblem({
              variables: {
                input: {
                  name: randomPhrase(problemPhraseGroups),
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
