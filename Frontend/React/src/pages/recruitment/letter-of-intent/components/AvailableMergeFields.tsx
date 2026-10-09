import {
  LETTER_OF_INTENT_MERGE_FIELDS,
} from "../constants/letterOfIntent.constants";
import "./AvailableMergeFields.css";

interface AvailableMergeFieldsProps {
  onInsert: (
    field: string,
  ) => void;
}

const AvailableMergeFields = ({
  onInsert,
}: AvailableMergeFieldsProps) => {
  return (
    <aside className="loi-merge-fields">
      <h4>Available Fields</h4>

      <p>
        Click to insert merge fields in the template.
      </p>

      <div className="loi-merge-field-list">
        {LETTER_OF_INTENT_MERGE_FIELDS.map(
          (field) => (
            <button
              key={field}
              type="button"
              onClick={() => onInsert(field)}
            >
              {field}
            </button>
          ),
        )}
      </div>
    </aside>
  );
};

export default AvailableMergeFields;