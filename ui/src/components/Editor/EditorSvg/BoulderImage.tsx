import { useContext } from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { SvgContext } from "components/Editor/util/context";
import { editorTourTags } from "../EditorTour";
import { BoulderImage_boulderNode$key } from "./__generated__/BoulderImage_boulderNode.graphql";

interface Props {
  boulderKey: BoulderImage_boulderNode$key;
}

/**
 * Boulder background image
 */
const BoulderImage: React.FC<Props> = ({ boulderKey }) => {
  const boulder = useFragment(
    graphql`
      fragment BoulderImage_boulderNode on BoulderNode {
        image {
          url
        }
      }
    `,
    boulderKey
  );
  const { dimensions } = useContext(SvgContext);

  return (
    <image
      href={boulder.image.url}
      // Fill the whole SVG
      width={dimensions.width}
      height={dimensions.height}
      data-tour={editorTourTags.boulderImage}
    />
  );
};

export default BoulderImage;
