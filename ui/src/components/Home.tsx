import { Grid } from "@mui/material";
import React from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import BoulderImageCard from "./BoulderImageCard";
import BoulderImageUpload from "./BoulderImageUpload";
import PageLayout from "./PageLayout";
import { HomeQuery } from "./__generated__/HomeQuery.graphql";

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

  return (
    <PageLayout>
      <Grid container spacing={2}>
        {data.images &&
          data.images.edges.map(({ node }) => (
            <Grid key={node.id} item>
              <BoulderImageCard imageKey={node} />
            </Grid>
          ))}

        <Grid item xs={12}>
          <BoulderImageUpload
            connections={data.images ? [data.images.__id] : []}
          />
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default Home;
