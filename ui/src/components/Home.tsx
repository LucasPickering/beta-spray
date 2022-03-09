import React from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import { Link } from "react-router-dom";
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
    <div>
      {data.images && (
        <ul>
          {data.images.edges.map(({ node }) => (
            <li key={node.id}>
              <Link to={`/images/${node.id}`}>
                Uploaded at {node.createdAt}
              </Link>
            </li>
          ))}
        </ul>
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
    </div>
  );
};

export default Home;
