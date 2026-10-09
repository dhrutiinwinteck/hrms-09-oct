import {
  ImageUp,
  Loader2,
  X,
} from "lucide-react";

import "./SignatureUpload.css";

import {
  ALLOWED_SIGNATURE_TYPES,
  MAX_SIGNATURE_SIZE_BYTES,
} from "../constants/letterOfIntent.constants";

import { getFileUrl } from "../../utils/fileUrl";

interface SignatureUploadProps {
  signature: string | null;
  uploading: boolean;
  onUpload: (file: File) => Promise<boolean>;
  onRemove: () => void;
}

/* ============================================================
   HELPERS
   ============================================================ */

const clamp = (
  value: number,
  min: number,
  max: number,
): number => {
  return Math.min(
    max,
    Math.max(min, value),
  );
};

const getLuminance = (
  r: number,
  g: number,
  b: number,
): number => {
  return (
    0.299 * r +
    0.587 * g +
    0.114 * b
  );
};

const getColorDistance = (
  r: number,
  g: number,
  b: number,
  br: number,
  bg: number,
  bb: number,
): number => {
  return Math.sqrt(
    Math.pow(r - br, 2) +
      Math.pow(g - bg, 2) +
      Math.pow(b - bb, 2),
  );
};

/* ============================================================
   MEDIAN
   ============================================================ */

const getMedian = (
  values: number[],
): number => {
  if (!values.length) {
    return 255;
  }

  const sorted = [...values].sort(
    (a, b) => a - b,
  );

  const middle =
    Math.floor(sorted.length / 2);

  if (
    sorted.length % 2 === 0
  ) {
    return (
      (sorted[middle - 1] +
        sorted[middle]) /
      2
    );
  }

  return sorted[middle];
};

/* ============================================================
   ESTIMATE PAPER COLOR
   ============================================================ */

/**
 * Estimates the photographed paper/background color
 * using ONLY the outer border of the image.
 *
 * This is important because the signature itself should
 * never be used as the background reference.
 */
const estimateBackgroundColor = (
  imageData: ImageData,
): {
  r: number;
  g: number;
  b: number;
} => {
  const {
    data,
    width,
    height,
  } = imageData;

  const red: number[] = [];
  const green: number[] = [];
  const blue: number[] = [];

  const borderX = Math.max(
    4,
    Math.floor(width * 0.08),
  );

  const borderY = Math.max(
    4,
    Math.floor(height * 0.08),
  );

  const addPixel = (
    x: number,
    y: number,
  ) => {
    const index =
      (y * width + x) * 4;

    red.push(
      data[index],
    );

    green.push(
      data[index + 1],
    );

    blue.push(
      data[index + 2],
    );
  };

  /*
   * Top + bottom
   */
  for (
    let y = 0;
    y < borderY;
    y++
  ) {
    for (
      let x = 0;
      x < width;
      x += 3
    ) {
      addPixel(x, y);
      addPixel(
        x,
        height - 1 - y,
      );
    }
  }

  /*
   * Left + right
   */
  for (
    let y = borderY;
    y < height - borderY;
    y += 3
  ) {
    for (
      let x = 0;
      x < borderX;
      x++
    ) {
      addPixel(x, y);
      addPixel(
        width - 1 - x,
        y,
      );
    }
  }

  return {
    r: getMedian(red),
    g: getMedian(green),
    b: getMedian(blue),
  };
};

/* ============================================================
   SIGNATURE IMAGE PROCESSOR
   ============================================================ */

/**
 * Converts a photographed/scanned signature into
 * a transparent PNG.
 *
 * IMPORTANT:
 *
 * We DO NOT recolor the signature.
 *
 * We DO NOT make the signature pure black.
 *
 * We preserve the original RGB values and only
 * remove the paper by changing alpha.
 *
 * Therefore:
 *
 * Blue ink -> remains blue
 * Black ink -> remains black
 * Natural edges -> remain natural
 */
/**
 * Converts a photographed/scanned signature into
 * a transparent PNG.
 *
 * IMPORTANT:
 *
 * - Original RGB values are preserved.
 * - Signature color is NOT changed.
 * - Signature opacity is NOT reduced.
 * - Only the paper/background is removed.
 *
 * Therefore:
 *
 * Blue ink  -> remains the same blue
 * Black ink -> remains the same black
 * Dark ink  -> remains the same original RGB
 */
const processSignatureImage = (
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
                "Unable to process signature image.",
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
             SIGNATURE BOUNDS
             ================================================== */

          let minX = width;
          let minY = height;
          let maxX = -1;
          let maxY = -1;

          /* ==================================================
             DETECT SIGNATURE
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
                 BLUE DOMINANCE
                 ---------------------------------------------- */

              const blueDominance =
                b -
                Math.max(
                  r,
                  g,
                );

              /* ----------------------------------------------
                 SIGNATURE DETECTION
                 
                 Blue signature:
                 - blue is stronger than red/green
                 - sufficient saturation
                 - reasonably dark

                 Dark signature:
                 - low luminance
                 ---------------------------------------------- */

              const isBlueInk =
                blueDominance >= 8 &&
                saturation >= 15 &&
                luminance <= 190;

              const isDarkInk =
                luminance <= 85;

              const isInk =
                isBlueInk ||
                isDarkInk;

              /* ----------------------------------------------
                 REMOVE PAPER
                 ---------------------------------------------- */

              if (!isInk) {
                pixels[index + 3] = 0;

                continue;
              }

              /* ----------------------------------------------
                 IMPORTANT
                 
                 DO NOT CHANGE RGB.
                 
                 DO NOT REDUCE OPACITY.
                 
                 Keep the original photographed RGB
                 values exactly as they were.
                 ---------------------------------------------- */

              pixels[index] = r;
              pixels[index + 1] = g;
              pixels[index + 2] = b;

              /*
               * FULL OPACITY.
               *
               * This prevents blue ink from becoming
               * lighter after compositing onto white.
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
                "No signature could be detected. Please upload a clearer signature image.",
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
                "Unable to create transparent signature.",
              ),
            );

            return;
          }

          /*
           * Completely transparent background.
           */

          outputContext.clearRect(
            0,
            0,
            cropWidth,
            cropHeight,
          );

          /*
           * Copy processed signature.
           */

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
                    "Unable to create transparent signature PNG.",
                  ),
                );

                return;
              }

              const processedFile =
                new File(
                  [blob],
                  "hr-signature.png",
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
            "Unable to read the signature image.",
          ),
        );
      };

      image.src = objectUrl;
    },
  );
};

/* ============================================================
   COMPONENT
   ============================================================ */

const SignatureUpload = ({
  signature,
  uploading,
  onUpload,
  onRemove,
}: SignatureUploadProps) => {
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
        /* ----------------------------------------------------
           FILE TYPE
           ---------------------------------------------------- */

        if (
          !ALLOWED_SIGNATURE_TYPES.includes(
            file.type as
              (typeof ALLOWED_SIGNATURE_TYPES)[number],
          )
        ) {
          console.error(
            "Unsupported signature file type.",
          );

          return;
        }

        /* ----------------------------------------------------
           FILE SIZE
           ---------------------------------------------------- */

        if (
          file.size >
          MAX_SIGNATURE_SIZE_BYTES
        ) {
          console.error(
            "Signature image must not exceed 2 MB.",
          );

          return;
        }

        /* ----------------------------------------------------
           REMOVE PAPER
           ---------------------------------------------------- */

        const processedFile =
          await processSignatureImage(
            file,
          );

        /* ----------------------------------------------------
           UPLOAD
           ---------------------------------------------------- */

        await onUpload(
          processedFile,
        );
      } catch (error) {
        console.error(
          "Signature processing failed:",
          error,
        );
      } finally {
        event.target.value = "";
      }
    };

  // const signatureUrl =
  //   getFileUrl(signature);

  const signatureUrl =
  signature &&
  (
    signature.startsWith("http://") ||
    signature.startsWith("https://") ||
    signature.startsWith("blob:") ||
    signature.startsWith("data:")
  )
    ? signature
    : getFileUrl(signature);

  return (
    <div className="loi-signature-upload loi-field">
      <span>
        HR Signature
      </span>

      <div className="loi-signature-upload-row">

        {/* ==================================================
            UPLOAD
            ================================================== */}

        <label
          className={`loi-signature-dropzone ${
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
                className="loi-signature-spin"
              />

              <strong>
                Processing...
              </strong>

              <small>
                Removing paper background
              </small>
            </>
          ) : (
            <>
              <ImageUp
                size={22}
              />

              <strong>
                Upload HR Signature
              </strong>

              <small>
                JPG, PNG or WEBP
              </small>

              <small>
                Paper background removed automatically
              </small>
            </>
          )}
        </label>

        {/* ==================================================
            CURRENT SIGNATURE
            ================================================== */}

        {signature && (
          <div className="loi-signature-preview">

            <button
              type="button"
              className="loi-signature-remove"
              onClick={
                onRemove
              }
              disabled={
                uploading
              }
              aria-label="Remove signature"
            >
              <X
                size={13}
              />
            </button>

            <div className="loi-signature-image-box">
              <img
                src={signatureUrl}
                alt="Current HR signature"
              />
            </div>

            <small>
              Current Signature
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignatureUpload;
