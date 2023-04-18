interface Props {
  kind: "hold" | "beta";
  isEditing: boolean;
}

/**
 * A visual SVG filter that indicates an item is/isn't editable.
 */
const EditableFilter: React.FC<Props> = ({ kind, isEditing }) => (
  <filter id={getEditableFilterId(kind)} filterUnits="objectBoundingBox">
    <feColorMatrix
      type="saturate"
      in="SourceGraphic"
      // TODO put this value in the theme
      values={isEditing ? "1.0" : "0.4"}
    />
  </filter>
);

function getEditableFilterId(kind: Props["kind"]): string {
  return `${kind}-editable-filter`;
}

/**
 * Get an SVG URL of an editable filter.
 * @returns A string that can be passed to the filter= attribute of an element
 */
export function getEditableFilterUrl(kind: Props["kind"]): string {
  return `url(#${getEditableFilterId(kind)})`;
}

export default EditableFilter;
