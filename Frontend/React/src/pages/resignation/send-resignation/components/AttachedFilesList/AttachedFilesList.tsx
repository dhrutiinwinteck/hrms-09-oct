import {
  FileText,
  FileImage,
  FileType,
  X,
} from "lucide-react";

import {
  formatFileSize,
  getFileType,
} from "../../utils/sendResignation.utils";

import "./AttachedFilesList.css";

interface AttachedFilesListProps {
  files: File[];
  error?: string;
  onRemove: (
    index: number,
  ) => void;
  onClear: () => void;
}

export const AttachedFilesList =
  ({
    files,
    error,
    onRemove,
    onClear,
  }: AttachedFilesListProps): JSX.Element | null => {
    if (
      files.length === 0 &&
      !error
    ) {
      return null;
    }

    const getIcon = (
      file: File,
    ): JSX.Element => {
      const type = getFileType(file);

      if (type === "pdf") {
        return (
          <FileText
            size={22}
          />
        );
      }

      if (type === "word") {
        return (
          <FileType
            size={22}
          />
        );
      }

      if (type === "image") {
        return (
          <FileImage
            size={22}
          />
        );
      }

      return (
        <FileText
          size={22}
        />
      );
    };

    return (
      <div className="attached-files">
        {files.length > 0 && (
          <div className="attached-files-header">
            <span>
              Attached Files ({files.length})
            </span>

            <button
              type="button"
              onClick={onClear}
            >
              Clear All
            </button>
          </div>
        )}

        <div className="attached-files-list">
          {files.map((file, index) => (
            <div
              className="attached-file"
              key={`${file.name}-${file.size}-${index}`}
            >
              <div className="attached-file-icon">
                {getIcon(file)}
              </div>

              <div className="attached-file-info">
                <strong title={file.name}>
                  {file.name}
                </strong>

                <span>
                  {formatFileSize(file.size)}
                </span>
              </div>

              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() =>
                  onRemove(index)
                }
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        {error && (
          <div className="attached-files-error">
            {error}
          </div>
        )}
      </div>
    );
  };