import React from "react";
import type { queriesProblemQuery as queriesProblemQueryType } from "__generated__/queriesProblemQuery.graphql";
import queriesProblemQuery from "__generated__/queriesProblemQuery.graphql";
import { GetServerSideProps } from "next";
import { getPreloadedQuery } from "util/environment";
import { useRouter } from "next/router";
import Editor from "components/Editor/Editor";
import { PreloadedQuery } from "react-relay";

interface RouteQuery {
  problemId: string;
}

interface Props {
  queryRefs: {
    problem: PreloadedQuery<queriesProblemQueryType>;
  };
}

// TODO comment
const EditorWithProblemId: React.FC<Props> = ({ queryRefs }) => {
  const router = useRouter();
  const { problemId } = router.query as RouteQuery;

  return <Editor problemId={problemId} queryRefs={queryRefs} />;
};

export const getServerSideProps: GetServerSideProps<
  Props,
  RouteQuery
> = async ({ params }) => ({
  props: {
    queryResponses: {
      problem: await getPreloadedQuery<queriesProblemQueryType>(
        queriesProblemQuery,
        { problemId: params?.problemId }
      ),
    },
  },
});

export default EditorWithProblemId;
