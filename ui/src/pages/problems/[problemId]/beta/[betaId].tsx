import React from "react";
import type { queriesProblemQuery as queriesProblemQueryType } from "__generated__/queriesProblemQuery.graphql";
import type { queriesBetaQuery as queriesBetaQueryType } from "__generated__/queriesBetaQuery.graphql";
import queriesBetaQuery from "__generated__/queriesBetaQuery.graphql";
import queriesProblemQuery from "__generated__/queriesProblemQuery.graphql";
import { getPreloadedQuery } from "util/environment";
import { useRouter } from "next/router";
import Editor from "components/Editor/Editor";
import { PreloadedQuery } from "react-relay";
import { NextPageExtended } from "pages/_app";
import { getQueryProps, GetServerSideQueryProps } from "util/relay";
import { assertIsDefined } from "util/func";

type RouteQuery = {
  problemId: string;
  betaId: string;
};

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

export const getServerSideProps: GetServerSideQueryProps<
  Props,
  RouteQuery
> = async ({ params }) => {
  assertIsDefined(params);
  return getQueryProps({
    problem: getPreloadedQuery<queriesProblemQueryType>(queriesProblemQuery, {
      problemId: params.problemId,
    }),
    beta: getPreloadedQuery<queriesBetaQueryType>(queriesBetaQuery, {
      betaId: params.betaId,
    }),
  });
};

export default EditorWithBetaId;
