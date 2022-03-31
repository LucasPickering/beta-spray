import { Grid, Typography } from "@mui/material";
import React from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import ProblemCard from "./ProblemCard";
import BoulderImageUpload from "./BoulderImageUpload";
import { HomeQuery } from "./__generated__/HomeQuery.graphql";

const Home: React.FC = () => {
  const data = useLazyLoadQuery<HomeQuery>(
    graphql`
      query HomeQuery {
        problems {
          __id
          edges {
            node {
              id
              ...ProblemCard_problemNode
            }
          }
        }
      }
    `,
    {}
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography component="h2" variant="h4">
          Problems
        </Typography>
      </Grid>
      {data.problems &&
        data.problems.edges.map(({ node }) => (
          <Grid key={node.id} item xs={12} sm={6} md={4}>
            <ProblemCard problemKey={node} />
          </Grid>
        ))}

      <Grid item xs={12}>
        <BoulderImageUpload
          connections={data.problems ? [data.problems.__id] : []}
        />
      </Grid>
    </Grid>
  );
};

export default Home;
