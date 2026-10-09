import {
  UploadCloud,
} from "lucide-react";
import {
  useRef,
} from "react";

import {
  SEND_RESIGNATION_CONSTANTS,
} from "../../constants/sendResignation.constants";

import "./AttachmentUploader.css";

interface AttachmentUploaderProps {
  onFilesSelected: (
    files: File[],
  ) => void;
}

export const AttachmentUploader =
  ({
    onFilesSelected,
  }: AttachmentUploaderProps): JSX.Element => {
    const inputRef =
      useRef<HTMLInputElement>(null);

    const processFiles = (
      fileList: FileList | null,
    ): void => {
      if (!fileList) {
        return;
      }

      onFilesSelected(
        Array.from(fileList),
      );

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    };

    return (
      <div className="attachment-uploader">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={
            SEND_RESIGNATION_CONSTANTS.FILES
              .ACCEPT
          }
          onChange={(event) =>
            processFiles(
              event.target.files,
            )
          }
          hidden
        />

        <button
          type="button"
          className="attachment-dropzone"
          onClick={() =>
            inputRef.current?.click()
          }
          onDragOver={(event) =>
            event.preventDefault()
          }
          onDrop={(event) => {
            event.preventDefault();

            onFilesSelected(
              Array.from(
                event.dataTransfer.files,
              ),
            );
          }}
        >
          <UploadCloud
            size={28}
            strokeWidth={1.8}
          />

          <strong>
            Drag & drop files here or{" "}
            <span>click to browse</span>
          </strong>

          <small>
            Supported formats: PDF, DOC,
            DOCX, JPG, JPEG, PNG
            {" "}
            (Max size: 10 MB each)
          </small>
        </button>
      </div>
    );
  };