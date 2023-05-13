import usePreviousValue from "util/usePreviousValue";
import { Divider, Stack, Typography, useTheme } from "@mui/material";
import { TourProvider, useTour } from "@reactour/tour";
import { useEffect } from "react";
import { allBodyParts, formatBodyPart } from "./util/svg";
import { BetaMoveIconWrapped } from "./EditorSvg/BetaEditor/BetaMoveIcon";
import { HoldIconWrapped } from "./EditorSvg/HoldEditor/HoldIcon";

const storageKey = "editorTour";
const storageValueHide = "hide";

interface Props {
  children?: React.ReactNode;
}

/**
 * A guided tour of the editor. Needs to be a parent of the entire editor so
 * the tour context can be exposed.
 */
const EditorTour: React.FC<Props> = ({ children }) => {
  const { palette } = useTheme();
  return (
    <TourProvider
      steps={steps}
      styles={{
        popover: (base) => ({
          ...base,
          color: palette.text.primary,
          backgroundColor: palette.background.paper,
        }),
        arrow: (base, { disabled = false }: { disabled?: boolean } = {}) => ({
          ...base,
          color: disabled ? palette.text.disabled : palette.text.primary,
        }),
        close: (base) => ({ ...base, color: palette.text.primary }),
      }}
    >
      <EditorTourControls />
      {children}
    </TourProvider>
  );
};

/**
 * Inner logic component. This has to be separate from the parent so it can
 * consume the context.
 */
const EditorTourControls: React.FC = () => {
  const { isOpen, setIsOpen } = useTour();
  const wasOpen = usePreviousValue(isOpen);

  // On first load, render storage
  useEffect(() => {
    // Check local storage to make sure we don't show the tour more than once
    if (localStorage.getItem(storageKey) !== storageValueHide) {
      setIsOpen(true);
    }
  }, [setIsOpen]);

  // Once the user closes the tour, remember that so we don't show it again
  useEffect(() => {
    if (wasOpen && !isOpen) {
      localStorage.setItem(storageKey, storageValueHide);
    }
  }, [wasOpen, isOpen]);

  return null;
};

const LegendIcon: React.FC<{ icon: React.ReactElement; label: string }> = ({
  icon,
  label,
}) => (
  <Stack key={label} direction="row" spacing={1}>
    {icon}
    <Typography variant="body2">{label}</Typography>
  </Stack>
);

export const editorTourTags = {
  editHoldsModeButton: "edit-holds-mode-button",
  editBetaModeButton: "edit-beta-mode-button",
  boulderImage: "boulder-image",
} as const;

function getSelector(tag: string): string {
  return `[data-tour=${tag}]`;
}

const steps = [
  {
    selector: getSelector(editorTourTags.editHoldsModeButton),
    content: (
      <>
        <div>
          Start by adding holds in <strong>Edit Holds</strong> mode. Only the
          uploader of the problem can edit holds.
        </div>
        <ul>
          <li>
            <strong>Click anywhere</strong> to add a hold
          </li>
          <li>
            <strong>Drag a hold</strong> to relocate
          </li>
          <li>
            <strong>Click a hold</strong> to edit notes or delete
          </li>
        </ul>
      </>
    ),
  },
  {
    selector: getSelector(editorTourTags.editBetaModeButton),
    content: (
      <>
        <div>
          Once the holds are marked, Enter <strong>Edit Beta</strong> mode. You
          can't edit other people's beta. To create your own, add a new entry
          (or copy and existing one) in the sidebar.
        </div>
        <ul>
          <li>
            <strong>Drag the + icon</strong> to add a move
          </li>
          <li>
            <strong>Drag a move</strong> to relocate
          </li>
          <li>
            <strong>Click a move</strong> to edit notes or delete
          </li>
          <li>
            <strong>Reorder moves</strong> in the sidebar
          </li>
        </ul>
      </>
    ),
  },
  {
    selector: getSelector(editorTourTags.boulderImage),
    content: (
      <>
        <div>Edit holds and beta here.</div>

        <Divider
          orientation="horizontal"
          sx={{ marginTop: 1, marginBottom: 1 }}
        />

        <LegendIcon icon={<HoldIconWrapped />} label="Hold" />

        {allBodyParts.map((bodyPart) => (
          <LegendIcon
            key={bodyPart}
            icon={<BetaMoveIconWrapped bodyPart={bodyPart} />}
            label={formatBodyPart(bodyPart)}
          />
        ))}

        <LegendIcon
          icon={<BetaMoveIconWrapped bodyPart="LEFT_HAND" isStart />}
          label="Start Move"
        />
        <LegendIcon
          icon={<BetaMoveIconWrapped bodyPart="LEFT_HAND" isFree />}
          label="Free Move (smear, flag, etc.)"
        />
      </>
    ),
  },
];

export default EditorTour;
