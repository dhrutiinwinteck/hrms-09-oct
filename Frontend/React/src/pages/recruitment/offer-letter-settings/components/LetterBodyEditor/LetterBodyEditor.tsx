import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Expand,
  Italic,
  Link,
  List,
  ListOrdered,
  Redo2,
  Underline,
  Undo2,
} from "lucide-react";

import "./LetterBodyEditor.css";

interface LetterBodyEditorProps {
  value: string;
  onChange: (value: string) => void;
  onInsertMergeField: (token: string) => void;
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="ol-editor-toolbar-button"
      title={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function LetterBodyEditor({
  value,
  onChange,
}: LetterBodyEditorProps) {
  const execute = (command: string, commandValue?: string) => {
    document.execCommand(command, false, commandValue);
  };

  return (
    <div className="ol-editor">
      <div className="ol-editor-toolbar">
        <select
          className="ol-editor-paragraph"
          defaultValue="p"
          onChange={(event) =>
            execute("formatBlock", event.target.value)
          }
        >
          <option value="p">Paragraph</option>
          <option value="h3">Heading</option>
          <option value="blockquote">Quote</option>
        </select>

        <span className="ol-toolbar-divider" />

        <ToolbarButton
          label="Bold"
          onClick={() => execute("bold")}
        >
          <Bold size={14} />
        </ToolbarButton>

        <ToolbarButton
          label="Italic"
          onClick={() => execute("italic")}
        >
          <Italic size={14} />
        </ToolbarButton>

        <ToolbarButton
          label="Underline"
          onClick={() => execute("underline")}
        >
          <Underline size={14} />
        </ToolbarButton>

        <span className="ol-toolbar-divider" />

        <ToolbarButton
          label="Bulleted list"
          onClick={() => execute("insertUnorderedList")}
        >
          <List size={14} />
        </ToolbarButton>

        <ToolbarButton
          label="Numbered list"
          onClick={() => execute("insertOrderedList")}
        >
          <ListOrdered size={14} />
        </ToolbarButton>

        <span className="ol-toolbar-divider" />

        <ToolbarButton
          label="Align left"
          onClick={() => execute("justifyLeft")}
        >
          <AlignLeft size={14} />
        </ToolbarButton>

        <ToolbarButton
          label="Align center"
          onClick={() => execute("justifyCenter")}
        >
          <AlignCenter size={14} />
        </ToolbarButton>

        <ToolbarButton
          label="Align right"
          onClick={() => execute("justifyRight")}
        >
          <AlignRight size={14} />
        </ToolbarButton>

        <ToolbarButton
          label="Link"
          onClick={() => {
            const url = window.prompt("Enter URL");

            if (url) {
              execute("createLink", url);
            }
          }}
        >
          <Link size={14} />
        </ToolbarButton>

        <span className="ol-toolbar-spacer" />

        <ToolbarButton
          label="Undo"
          onClick={() => execute("undo")}
        >
          <Undo2 size={14} />
        </ToolbarButton>

        <ToolbarButton
          label="Redo"
          onClick={() => execute("redo")}
        >
          <Redo2 size={14} />
        </ToolbarButton>

        <ToolbarButton
          label="Fullscreen"
          onClick={() => {
            const editor = document.querySelector(
              ".ol-editor",
            );

            editor?.requestFullscreen?.();
          }}
        >
          <Expand size={13} />
        </ToolbarButton>
      </div>

      <div
        className="ol-editor-content"
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{
          __html: value
            .replace(/\n\n/g, "<p></p>")
            .replace(/\n/g, "<br />"),
        }}
        onInput={(event) => {
          const html = event.currentTarget.innerHTML;

          const text = html
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<\/p>/gi, "\n")
            .replace(/<[^>]+>/g, "")
            .trim();

          onChange(text);
        }}
      />
    </div>
  );
}