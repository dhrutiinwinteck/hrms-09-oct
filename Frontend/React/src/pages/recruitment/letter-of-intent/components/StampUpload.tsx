// import {
//   Image as ImageIcon,
//   Upload,
//   X,
// } from "lucide-react";

// import "./StampUpload.css";

// import {
//   ALLOWED_STAMP_TYPES,
//   MAX_STAMP_SIZE_BYTES,
// } from "../constants/letterOfIntent.constants";

// import { getFileUrl } from "../../utils/fileUrl";

// interface StampUploadProps {
//   stamp: string | null;
//   uploading: boolean;
//   onUpload: (
//     file: File,
//   ) => Promise<boolean>;
//   onRemove: () => void;
// }

// const StampUpload = ({
//   stamp,
//   uploading,
//   onUpload,
//   onRemove,
// }: StampUploadProps) => {
//   const handleFileChange = async (
//     event: React.ChangeEvent<HTMLInputElement>,
//   ) => {
//     const file =
//       event.target.files?.[0];

//     event.target.value = "";

//     if (!file) {
//       return;
//     }

//     if (
//       !ALLOWED_STAMP_TYPES.includes(
//         file.type as
//           (typeof ALLOWED_STAMP_TYPES)[number],
//       )
//     ) {
//       return;
//     }

//     if (
//       file.size >
//       MAX_STAMP_SIZE_BYTES
//     ) {
//       return;
//     }

//     await onUpload(file);
//   };

//   const stampUrl = getFileUrl(stamp);

//   return (
//     <div className="loi-stamp-field">
//       <div className="loi-field-label">
//         HR Stamp
//       </div>

//       <div className="loi-stamp-upload-row">
//         <label className="loi-stamp-upload">
//           <input
//             type="file"
//             accept="image/jpeg,image/png,image/webp"
//             onChange={handleFileChange}
//             disabled={uploading}
//           />

//           <Upload size={20} />

//           <strong>
//             {uploading
//               ? "Uploading..."
//               : "Upload HR Stamp"}
//           </strong>

//           <span>
//             JPG, PNG or WEBP (Max 2MB)
//           </span>
//         </label>

//         {stamp ? (
//           <div className="loi-current-stamp">
//             <button
//               type="button"
//               aria-label="Remove stamp"
//               onClick={onRemove}
//             >
//               <X size={14} />
//             </button>

//             <img
//               src={stampUrl}
//               alt="Current HR stamp"
//               onError={(event) => {
//                 console.error(
//                   "Failed to load HR stamp:",
//                   stampUrl,
//                 );

//                 event.currentTarget.style.display =
//                   "none";
//               }}
//             />

//             <span>
//               Current Stamp
//             </span>
//           </div>
//         ) : (
//           <div className="loi-no-stamp">
//             <ImageIcon size={20} />

//             <span>
//               No stamp uploaded
//             </span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default StampUpload;

import {
  ImageUp,
  X,
  Loader2,
} from "lucide-react";

import "./StampUpload.css";

import { getFileUrl } from "../../utils/fileUrl";

interface StampUploadProps {
  stamp: string | null;
  uploading: boolean;
  onUpload: (
    file: File,
  ) => Promise<boolean>;
  onRemove: () => void;
}

/**
 * Converts a photographed stamp into a transparent PNG.
 */
/**
 * Converts a photographed/scanned stamp into
 * a transparent PNG.
 *
 * IMPORTANT:
 *
 * - Original RGB values are preserved.
 * - Stamp color is NOT changed.
 * - Stamp opacity is NOT reduced.
 * - Only the paper/background is removed.
 */
const processStampImage = (
  file: File,
): Promise<File> => {
  return new Promise(
    (resolve, reject) => {
      const image = new Image();

      const objectUrl =
        URL.createObjectURL(file);

      image.onload = () => {
        try {
          URL.revokeObjectURL(
            objectUrl,
          );

          /* ==================================================
             RESIZE
             ================================================== */

          const MAX_SIZE = 1800;

          const scale = Math.min(
            1,
            MAX_SIZE /
              Math.max(
                image.naturalWidth,
                image.naturalHeight,
              ),
          );

          const width = Math.max(
            1,
            Math.round(
              image.naturalWidth * scale,
            ),
          );

          const height = Math.max(
            1,
            Math.round(
              image.naturalHeight * scale,
            ),
          );

          const canvas =
            document.createElement(
              "canvas",
            );

          canvas.width = width;
          canvas.height = height;

          const context =
            canvas.getContext(
              "2d",
              {
                willReadFrequently: true,
              },
            );

          if (!context) {
            reject(
              new Error(
                "Unable to process stamp image.",
              ),
            );

            return;
          }

          context.drawImage(
            image,
            0,
            0,
            width,
            height,
          );

          const imageData =
            context.getImageData(
              0,
              0,
              width,
              height,
            );

          const pixels =
            imageData.data;

          /* ==================================================
             STAMP BOUNDS
             ================================================== */

          let minX = width;
          let minY = height;
          let maxX = -1;
          let maxY = -1;

          /* ==================================================
             DETECT STAMP INK
             ================================================== */

          for (
            let y = 0;
            y < height;
            y++
          ) {
            for (
              let x = 0;
              x < width;
              x++
            ) {
              const index =
                (y * width + x) * 4;

              const r =
                pixels[index];

              const g =
                pixels[index + 1];

              const b =
                pixels[index + 2];

              /* ----------------------------------------------
                 LUMINANCE
                 ---------------------------------------------- */

              const luminance =
                0.299 * r +
                0.587 * g +
                0.114 * b;

              /* ----------------------------------------------
                 SATURATION
                 ---------------------------------------------- */

              const maxChannel =
                Math.max(
                  r,
                  g,
                  b,
                );

              const minChannel =
                Math.min(
                  r,
                  g,
                  b,
                );

              const saturation =
                maxChannel -
                minChannel;

              /* ----------------------------------------------
                 BLUE / PURPLE DETECTION
                 ---------------------------------------------- */

              const blueDominance =
                b -
                Math.max(
                  r,
                  g * 0.92,
                );

              const isBluePurpleInk =
                saturation >= 20 &&
                blueDominance >= 8 &&
                luminance <= 200;

              /* ----------------------------------------------
                 DARK STAMP INK
                 ---------------------------------------------- */

              const isDarkInk =
                luminance <= 80;

              const isInk =
                isBluePurpleInk ||
                isDarkInk;

              /* ----------------------------------------------
                 REMOVE PAPER
                 ---------------------------------------------- */

              if (!isInk) {
                pixels[index + 3] = 0;

                continue;
              }

              /* ----------------------------------------------
                 PRESERVE ORIGINAL COLOR
                 
                 DO NOT:
                 - recolor
                 - darken
                 - lighten
                 - apply filter
                 - reduce opacity
                 ---------------------------------------------- */

              pixels[index] = r;
              pixels[index + 1] = g;
              pixels[index + 2] = b;

              /*
               * FULL OPACITY.
               *
               * This keeps the stamp color from becoming
               * lighter when displayed on white paper.
               */

              pixels[index + 3] = 255;

              /* ----------------------------------------------
                 BOUNDS
                 ---------------------------------------------- */

              minX = Math.min(
                minX,
                x,
              );

              minY = Math.min(
                minY,
                y,
              );

              maxX = Math.max(
                maxX,
                x,
              );

              maxY = Math.max(
                maxY,
                y,
              );
            }
          }

          /* ==================================================
             VALIDATION
             ================================================== */

          if (
            maxX < 0 ||
            maxY < 0
          ) {
            reject(
              new Error(
                "No stamp ink could be detected. Please upload a clearer stamp image.",
              ),
            );

            return;
          }

          /* ==================================================
             APPLY TRANSPARENCY
             ================================================== */

          context.putImageData(
            imageData,
            0,
            0,
          );

          /* ==================================================
             CROP
             ================================================== */

          const padding = 12;

          minX = Math.max(
            0,
            minX - padding,
          );

          minY = Math.max(
            0,
            minY - padding,
          );

          maxX = Math.min(
            width - 1,
            maxX + padding,
          );

          maxY = Math.min(
            height - 1,
            maxY + padding,
          );

          const cropWidth =
            maxX - minX + 1;

          const cropHeight =
            maxY - minY + 1;

          /* ==================================================
             OUTPUT CANVAS
             ================================================== */

          const outputCanvas =
            document.createElement(
              "canvas",
            );

          outputCanvas.width =
            cropWidth;

          outputCanvas.height =
            cropHeight;

          const outputContext =
            outputCanvas.getContext(
              "2d",
            );

          if (!outputContext) {
            reject(
              new Error(
                "Unable to create transparent stamp.",
              ),
            );

            return;
          }

          outputContext.clearRect(
            0,
            0,
            cropWidth,
            cropHeight,
          );

          outputContext.drawImage(
            canvas,
            minX,
            minY,
            cropWidth,
            cropHeight,
            0,
            0,
            cropWidth,
            cropHeight,
          );

          /* ==================================================
             EXPORT PNG
             ================================================== */

          outputCanvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(
                  new Error(
                    "Unable to create transparent stamp PNG.",
                  ),
                );

                return;
              }

              const processedFile =
                new File(
                  [blob],
                  "hr-stamp.png",
                  {
                    type: "image/png",
                  },
                );

              resolve(
                processedFile,
              );
            },
            "image/png",
            1,
          );
        } catch (error) {
          URL.revokeObjectURL(
            objectUrl,
          );

          reject(error);
        }
      };

      image.onerror = () => {
        URL.revokeObjectURL(
          objectUrl,
        );

        reject(
          new Error(
            "Unable to read the stamp image.",
          ),
        );
      };

      image.src = objectUrl;
    },
  );
};

const StampUpload = ({
  stamp,
  uploading,
  onUpload,
  onRemove,
}: StampUploadProps) => {
  const handleFileChange =
    async (
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      try {
        const processedFile =
          await processStampImage(
            file,
          );

        await onUpload(
          processedFile,
        );
      } catch (error) {
        console.error(
          "Stamp processing failed:",
          error,
        );
      } finally {
        event.target.value = "";
      }
    };

  /*
   * IMPORTANT:
   * API path -> complete browser URL.
   */
  // const stampUrl = getFileUrl(
  //   stamp,
  // );

  const stampUrl =
  stamp &&
  (
    stamp.startsWith("http://") ||
    stamp.startsWith("https://") ||
    stamp.startsWith("blob:") ||
    stamp.startsWith("data:")
  )
    ? stamp
    : getFileUrl(stamp);

  return (
    <div className="loi-stamp-upload loi-field">

      <span>
        HR Stamp
      </span>

      <div className="loi-stamp-upload-row">

        <label
          className={`loi-stamp-dropzone ${
            uploading
              ? "is-uploading"
              : ""
          }`}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={
              handleFileChange
            }
            disabled={uploading}
            hidden
          />

          {uploading ? (
            <>
              <Loader2
                size={22}
                className="loi-stamp-spin"
              />

              <strong>
                Processing...
              </strong>

              <small>
                Removing background
              </small>
            </>
          ) : (
            <>
              <ImageUp size={22} />

              <strong>
                Upload HR Stamp
              </strong>

              <small>
                JPG, PNG or WEBP
              </small>

              <small>
                Background removed automatically
              </small>
            </>
          )}
        </label>

        {stamp && (
          <div className="loi-stamp-preview">

            <button
              type="button"
              className="loi-stamp-remove"
              onClick={onRemove}
              disabled={uploading}
              aria-label="Remove stamp"
            >
              <X size={13} />
            </button>

            <div className="loi-stamp-image-box">

              <img
                src={stampUrl}
                alt="Current HR stamp"
                onError={() => {
                  console.error(
                    "Failed to load HR stamp:",
                    stampUrl,
                  );
                }}
              />

            </div>

            <small>
              Current Stamp
            </small>

          </div>
        )}

      </div>

    </div>
  );
};

export default StampUpload;