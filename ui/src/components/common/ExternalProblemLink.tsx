import { Link } from "@mui/material";
import { isDefined } from "util/func";
import { getExternalLinkLabel } from "util/validator";

interface Props {
  children?: string;
}

/**
 * Render an external problem link (e.g. to Mountain Project) as a neat label
 * instead of an ugly URL. The label text will be selected based on the hostname
 * of the link.
 */
const ExternalProblemLink: React.FC<Props> = ({ children }) => {
  if (!isDefined(children)) {
    return null;
  }

  let url;
  try {
    url = new URL(children);
  } catch (e) {
    return null;
  }

  const label = getExternalLinkLabel(url);
  return <Link href={children}>{label}</Link>;
};

export default ExternalProblemLink;
