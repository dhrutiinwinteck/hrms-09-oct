import { Copy } from "lucide-react";

import { OFFER_LETTER_MERGE_FIELDS } from "../../constants/offerLetter.constants";

import "./MergeFields.css";

interface MergeFieldsProps {
  onInsert: (token: string) => void;
}

export default function MergeFields({
  onInsert,
}: MergeFieldsProps) {
  return (
    <aside className="ol-merge-panel">
      <div className="ol-merge-panel-title">
        Available Fields
      </div>

      <div className="ol-merge-panel-subtitle">
        Click to insert merge fields in the template.
      </div>

      <div className="ol-merge-list">
        {OFFER_LETTER_MERGE_FIELDS.map((field) => (
          <button
            key={field.key}
            type="button"
            className="ol-merge-chip"
            onClick={() => onInsert(field.token)}
          >
            {field.token}

            <Copy size={9} />
          </button>
        ))}
      </div>
    </aside>
  );
}