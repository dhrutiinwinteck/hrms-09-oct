import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Italic,
  Link,
  List,
  ListOrdered,
  Maximize,
  Redo2,
  Underline,
  Undo2,
} from "lucide-react";
import "./LetterBodyEditor.css";

interface LetterBodyEditorProps {
  value: string;
  onChange: (
    value: string,
  ) => void;
  error?: string;
}

const LetterBodyEditor = ({
  value,
  onChange,
  error,
}: LetterBodyEditorProps) => {
  const exec = (
    command: string,
    commandValue?: string,
  ) => {
    document.execCommand(
      command,
      false,
      commandValue,
    );
  };

  const insertText = (
    text: string,
  ) => {
    exec("insertText", text);
  };

  const handleInput = (
    event: React.FormEvent<HTMLDivElement>,
  ) => {
    onChange(
      event.currentTarget.innerText,
    );
  };

  return (
    <div className="loi-editor-wrapper">
      <div className="loi-editor-toolbar">
        <select
          defaultValue="paragraph"
          onChange={(event) => {
            if (
              event.target.value ===
              "heading"
            ) {
              exec("formatBlock", "h3");
            } else {
              exec("formatBlock", "p");
            }
          }}
          aria-label="Text format"
        >
          <option value="paragraph">
            Paragraph
          </option>

          <option value="heading">
            Heading
          </option>
        </select>

        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            exec("bold");
          }}
          title="Bold"
        >
          <Bold size={15} />
        </button>

        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            exec("italic");
          }}
          title="Italic"
        >
          <Italic size={15} />
        </button>

        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            exec("underline");
          }}
          title="Underline"
        >
          <Underline size={15} />
        </button>

        <span className="loi-toolbar-divider" />

        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            exec("insertUnorderedList");
          }}
          title="Bullet List"
        >
          <List size={15} />
        </button>

        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            exec("insertOrderedList");
          }}
          title="Numbered List"
        >
          <ListOrdered size={15} />
        </button>

        <span className="loi-toolbar-divider" />

        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            exec("justifyLeft");
          }}
          title="Align Left"
        >
          <AlignLeft size={15} />
        </button>

        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            exec("justifyCenter");
          }}
          title="Align Center"
        >
          <AlignCenter size={15} />
        </button>

        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            exec("justifyRight");
          }}
          title="Align Right"
        >
          <AlignRight size={15} />
        </button>

        <button
          type="button"
          onMouseDown={() => {
            const url =
              window.prompt(
                "Enter URL",
              );

            if (url) {
              exec(
                "createLink",
                url,
              );
            }
          }}
          title="Insert Link"
        >
          <Link size={15} />
        </button>

        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            exec("undo");
          }}
          title="Undo"
        >
          <Undo2 size={15} />
        </button>

        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            exec("redo");
          }}
          title="Redo"
        >
          <Redo2 size={15} />
        </button>

        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();

            const editor =
              document.querySelector(
                ".loi-editor-content",
              );

            editor?.requestFullscreen();
          }}
          title="Fullscreen"
        >
          <Maximize size={15} />
        </button>
      </div>

      <div
        className={`loi-editor-content ${
          error
            ? "loi-editor-content-error"
            : ""
        }`}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder="Enter your Letter of Intent content..."
        ref={(element) => {
          if (
            element &&
            element.innerText !== value
          ) {
            element.innerText = value;
          }
        }}
      />

      {error && (
        <span className="loi-validation-error">
          {error}
        </span>
      )}
    </div>
  );
};

export default LetterBodyEditor;