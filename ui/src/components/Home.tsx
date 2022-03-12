import { Box, SimpleGrid } from "@chakra-ui/react";
import React from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import BoulderImageCard from "./BoulderImageCard";
import { HomeQuery } from "./__generated__/HomeQuery.graphql";
import { Home_createImageMutation } from "./__generated__/Home_createImageMutation.graphql";

const Home: React.FC = () => {
  const data = useLazyLoadQuery<HomeQuery>(
    graphql`
      query HomeQuery {
        images {
          __id
          edges {
            node {
              id
              ...BoulderImageCard_imageNode
            }
          }
        }
      }
    `,
    {}
  );

  // TODO move to another component
  const [uploadImage] = useMutation<Home_createImageMutation>(graphql`
    mutation Home_createImageMutation(
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
    <Box margin={4}>
      <SimpleGrid columns={[2, 4]}>
        {data.images &&
          data.images.edges.map(({ node }) => (
            <BoulderImageCard key={node.id} imageKey={node} />
          ))}
      </SimpleGrid>
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
                connections: data.images ? [data.images.__id] : [],
              },
              uploadables: {
                boulderImage: e.target.files[0],
              },
            });
          }
        }}
      />
    </Box>
  );
};

export default Home;
