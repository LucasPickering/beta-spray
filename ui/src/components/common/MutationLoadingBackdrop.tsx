import { Backdrop, Portal } from "@mui/material";
import { MutationState } from "util/useMutation";
import Loading from "./Loading";

interface Props {
  mutationState: MutationState;
  message: string;
}

/**
 * Fullscreen loading backdrop. Use this very sparingly! Only when the pending
 * mutation should block all actions (e.g. deleting the primary resource on
 * the page).
 */
const MutationLoadingBackdrop: React.FC<Props> = ({
  mutationState,
  message,
}) => (
  <Portal>
    <Backdrop open={mutationState.status === "loading"}>
      <Loading size={100} message={message} />
    </Backdrop>
  </Portal>
);

export default MutationLoadingBackdrop;
