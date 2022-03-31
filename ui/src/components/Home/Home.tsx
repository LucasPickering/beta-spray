import React from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { HomeQuery } from "./__generated__/HomeQuery.graphql";
import ProblemList from "./ProblemList";

const Home: React.FC = () => {
  const data = useLazyLoadQuery<HomeQuery>(
    graphql`
      query HomeQuery {
        problems {
          ...ProblemList_problemConnection
        }
      }
    `,
    {}
  );

  return data.problems && <ProblemList problemConnectionKey={data.problems} />;
};

export default Home;
