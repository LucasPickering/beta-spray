import React from "react";
import type { queriesProblemQuery as queriesProblemQueryType } from "__generated__/queriesProblemQuery.graphql";
import type { queriesBetaQuery as queriesBetaQueryType } from "__generated__/queriesBetaQuery.graphql";
import queriesBetaQuery from "__generated__/queriesBetaQuery.graphql";
import queriesProblemQuery from "__generated__/queriesProblemQuery.graphql";
import { GetServerSideProps } from "next";
import { getPreloadedQuery } from "util/environment";
import { useRouter } from "next/router";
import Editor from "components/Editor/Editor";
import { PreloadedQuery } from "react-relay";
import { NextPageExtended } from "pages/_app";

interface RouteQuery {
  problemId: string;
  betaId: string;
}

interface Props {
  queryRefs: {
    problem: PreloadedQuery<queriesProblemQueryType>;
    beta: PreloadedQuery<queriesBetaQueryType>;
  };
}

// TODO comment
const EditorWithBetaId: NextPageExtended<Props> = ({ queryRefs }) => {
  const router = useRouter();
  const { problemId, betaId } = router.query as RouteQuery;

  return <Editor problemId={problemId} betaId={betaId} queryRefs={queryRefs} />;
};

EditorWithBetaId.isFullscreen = true;

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
      beta: await getPreloadedQuery<queriesBetaQueryType>(queriesBetaQuery, {
        betaId: params?.betaId,
      }),
    },
  },
});

export default EditorWithBetaId;
