import { Box, Link, ListItem, UnorderedList } from "@chakra-ui/react";
import React from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import { Link as RouterLink } from "react-router-dom";
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
              createdAt
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
          # TODO fragment
          id
          createdAt
        }
      }
    }
  `);

  return (
    <Box margin={4}>
      {data.images && (
        <UnorderedList>
          {data.images.edges.map(({ node }) => (
            <ListItem key={node.id}>
              <Link as={RouterLink} to={`/images/${node.id}`}>
                Uploaded at {new Date(node.createdAt).toUTCString()}
              </Link>
            </ListItem>
          ))}
        </UnorderedList>
      )}
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
