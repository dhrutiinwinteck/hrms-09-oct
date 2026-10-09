import html2pdf from "html2pdf.js";

export const generateLetterOfIntentPdf =
  async (
    filename = "letter-of-intent.pdf",
  ): Promise<void> => {
    const element =
      document.getElementById(
        "loi-pdf-paper",
      );

    if (!element) {
      throw new Error(
        "Letter of Intent preview could not be found.",
      );
    }

    /*
     * ============================================================
     * CLONE PREVIEW
     * ============================================================
     */

    const clonedElement =
      element.cloneNode(
        true,
      ) as HTMLElement;

    /*
     * ============================================================
     * PDF A4 DIMENSIONS
     * ============================================================
     *
     * Approximate A4 size at 96 DPI:
     *
     * Width  : 794px
     * Height : 1123px
     *
     * This gives us a consistent PDF layout.
     */

    clonedElement.style.width =
      "794px";

    clonedElement.style.minWidth =
      "794px";

    clonedElement.style.maxWidth =
      "794px";

    clonedElement.style.height =
      "1123px";

    clonedElement.style.minHeight =
      "1123px";

    clonedElement.style.margin =
      "0";

    clonedElement.style.boxSizing =
      "border-box";

    clonedElement.style.background =
      "#ffffff";

    clonedElement.style.boxShadow =
      "none";

    clonedElement.style.border =
      "none";

    /*
     * ============================================================
     * CREATE HIDDEN PDF WRAPPER
     * ============================================================
     */

    const wrapper =
      document.createElement(
        "div",
      );

    wrapper.style.position =
      "fixed";

    wrapper.style.left =
      "-100000px";

    wrapper.style.top =
      "0";

    wrapper.style.width =
      "794px";

    wrapper.style.minHeight =
      "1123px";

    wrapper.style.background =
      "#ffffff";

    wrapper.style.zIndex =
      "-1";

    wrapper.appendChild(
      clonedElement,
    );

    document.body.appendChild(
      wrapper,
    );

    try {
      /*
       * ==========================================================
       * WAIT FOR IMAGES
       * ==========================================================
       *
       * This is important for:
       *
       * - Company Logo
       * - HR Stamp
       */

      const images =
        Array.from(
          clonedElement.querySelectorAll(
            "img",
          ),
        );

      await Promise.all(
        images.map(
          (
            image,
          ) =>
            new Promise<void>(
              (
                resolve,
              ) => {
                if (
                  image.complete
                ) {
                  resolve();
                  return;
                }

                image.onload =
                  () => {
                    resolve();
                  };

                image.onerror =
                  () => {
                    console.warn(
                      "Unable to load LOI preview image:",
                      image.src,
                    );

                    /*
                     * Do not stop PDF generation
                     * because an optional image
                     * failed.
                     */

                    resolve();
                  };
              },
            ),
        ),
      );

      /*
       * ==========================================================
       * ALLOW BROWSER TO COMPLETE LAYOUT
       * ==========================================================
       */

      await new Promise<void>(
        (
          resolve,
        ) => {
          window.requestAnimationFrame(
            () => {
              window.requestAnimationFrame(
                () => {
                  resolve();
                },
              );
            },
          );
        },
      );

      /*
       * ==========================================================
       * PDF OPTIONS
       * ==========================================================
       */

      const options = {
        margin: 0,

        filename,

        image: {
          type: "jpeg" as const,
          quality: 0.98,
        },

        html2canvas: {
          scale: 2,

          useCORS: true,

          allowTaint: false,

          backgroundColor:
            "#ffffff",

          logging: false,

          imageTimeout: 15000,
        },

        jsPDF: {
          unit: "mm" as const,

          format: "a4" as const,

          orientation:
            "portrait" as const,

          compress: true,
        },

        pagebreak: {
          mode: [
            "css",
            "legacy",
          ] as const,
        },
      };

      /*
       * ==========================================================
       * GENERATE PDF BLOB
       * ==========================================================
       */

      const pdfBlob =
        await html2pdf()
          .set(options)
          .from(clonedElement)
          .outputPdf(
            "blob",
          );

      /*
       * ==========================================================
       * CREATE BROWSER OBJECT URL
       * ==========================================================
       */

      const pdfUrl =
        URL.createObjectURL(
          pdfBlob,
        );

      /*
       * ==========================================================
       * OPEN PDF IN NEW TAB
       * ==========================================================
       *
       * Chrome's PDF viewer will provide:
       *
       * - Download
       * - Print
       * - Zoom
       */

      const pdfWindow =
        window.open(
          pdfUrl,
          "_blank",
        );

      /*
       * ==========================================================
       * POPUP BLOCKER FALLBACK
       * ==========================================================
       */

      if (!pdfWindow) {
        const downloadLink =
          document.createElement(
            "a",
          );

        downloadLink.href =
          pdfUrl;

        downloadLink.download =
          filename;

        document.body.appendChild(
          downloadLink,
        );

        downloadLink.click();

        downloadLink.remove();

        setTimeout(
          () => {
            URL.revokeObjectURL(
              pdfUrl,
            );
          },
          10000,
        );

        return;
      }

      /*
       * ==========================================================
       * CLEAN OBJECT URL
       * ==========================================================
       *
       * Give the browser PDF viewer enough time to load
       * the Blob before releasing the URL.
       */

      setTimeout(
        () => {
          URL.revokeObjectURL(
            pdfUrl,
          );
        },
        60000,
      );
    } finally {
      /*
       * ==========================================================
       * CLEAN HIDDEN DOM
       * ==========================================================
       */

      if (
        wrapper.parentNode
      ) {
        wrapper.parentNode.removeChild(
          wrapper,
        );
      }
    }
  };