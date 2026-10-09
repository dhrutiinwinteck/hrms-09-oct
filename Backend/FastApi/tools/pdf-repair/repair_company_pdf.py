from __future__ import annotations

from pathlib import Path
from typing import Iterable
import zlib

from pypdf import PdfReader, PdfWriter
from pypdf.generic import IndirectObject, StreamObject, NameObject


PROJECT_ROOT = Path(__file__).resolve().parents[2]

COMPANY_DOCUMENTS_DIR = (
    PROJECT_ROOT
    / "templates"
    / "documents"
    / "company"
)

SOURCE_PDF = (
    COMPANY_DOCUMENTS_DIR
    / "Inwinteck - Company Presentation.pdf"
)

OUTPUT_PDF = (
    COMPANY_DOCUMENTS_DIR
    / "Inwinteck - Company Presentation.repaired.pdf"
)


def iter_indirect_objects(
    reader: PdfReader,
) -> Iterable[tuple[int, int, object]]:
    """
    Enumerate all readable indirect PDF objects.
    """
    seen: set[tuple[int, int]] = set()

    for generation, objects in reader.xref.items():
        if not isinstance(objects, dict):
            continue

        for object_id in objects:
            if object_id == 0:
                continue

            key = (object_id, generation)

            if key in seen:
                continue

            seen.add(key)

            try:
                obj = IndirectObject(
                    object_id,
                    generation,
                    reader,
                ).get_object()

            except Exception as exc:
                print(
                    f"WARNING: Could not read "
                    f"object {object_id} {generation}: {exc}"
                )
                continue

            yield object_id, generation, obj


def get_filters(stream: StreamObject) -> list[str]:
    """
    Return PDF stream filters as strings.
    """
    value = stream.get("/Filter")

    if value is None:
        return []

    if isinstance(value, list):
        return [str(item) for item in value]

    return [str(value)]


def try_decompress(raw: bytes) -> tuple[bytes, str] | None:
    """
    Try the three common zlib-compatible formats.

    Returns:
        decoded bytes + compression format
    """

    attempts = (
        (
            "zlib",
            lambda: zlib.decompress(raw),
        ),
        (
            "raw-deflate",
            lambda: zlib.decompress(
                raw,
                -zlib.MAX_WBITS,
            ),
        ),
        (
            "gzip",
            lambda: zlib.decompress(
                raw,
                zlib.MAX_WBITS | 16,
            ),
        ),
    )

    for name, decoder in attempts:
        try:
            return decoder(), name
        except zlib.error:
            continue

    return None


def repair_company_pdf() -> int:
    if not SOURCE_PDF.is_file():
        print(f"ERROR: Source PDF not found:")
        print(SOURCE_PDF)
        return 1

    print("Opening source PDF...")
    print(SOURCE_PDF)
    print()

    reader = PdfReader(
        str(SOURCE_PDF),
        strict=False,
    )

    print(f"Pages detected: {len(reader.pages)}")
    print()

    flate_count = 0
    already_valid_count = 0
    repaired_count = 0
    unsupported_count = 0
    failed_count = 0

    for object_id, generation, obj in iter_indirect_objects(reader):

        if not isinstance(obj, StreamObject):
            continue

        filters = get_filters(obj)

        if "/FlateDecode" not in filters:
            continue

        flate_count += 1

        # We only safely handle a single FlateDecode filter.
        if filters != ["/FlateDecode"]:
            unsupported_count += 1

            print(
                f"UNSUPPORTED: object "
                f"{object_id} {generation}"
            )
            print(f"Filters: {filters}")
            print()

            continue

        raw = getattr(obj, "_data", None)

        if not isinstance(raw, bytes):
            failed_count += 1

            print(
                f"FAILED: object "
                f"{object_id} {generation}"
            )
            print("No raw stream data available.")
            print()

            continue

        result = try_decompress(raw)

        if result is None:
            failed_count += 1

            print(
                f"FAILED: object "
                f"{object_id} {generation}"
            )
            print(
                f"Could not decompress "
                f"{len(raw)} bytes."
            )
            print()

            continue

        decoded_data, compression_type = result

        # Normal zlib means this stream is already valid.
        if compression_type == "zlib":
            already_valid_count += 1
            continue

        # The stream is recoverable, but was stored using
        # raw-deflate or gzip instead of standard PDF zlib.
        repaired_data = zlib.compress(
            decoded_data,
            level=6,
        )

        obj[NameObject("/Filter")] = NameObject(
            "/FlateDecode"
        )

        obj.set_data(repaired_data)

        repaired_count += 1

        print(
            f"REPAIRED: object "
            f"{object_id} {generation}"
        )
        print(
            f"Compression: {compression_type} "
            f"-> standard zlib"
        )
        print(
            f"Size: {len(raw)} -> "
            f"{len(repaired_data)} bytes"
        )
        print()

    print("=" * 60)
    print("PDF STREAM ANALYSIS")
    print("=" * 60)
    print(f"Flate streams found:       {flate_count}")
    print(f"Already valid zlib:        {already_valid_count}")
    print(f"Streams repaired:          {repaired_count}")
    print(f"Unsupported streams:       {unsupported_count}")
    print(f"Unrecoverable streams:     {failed_count}")
    print("=" * 60)
    print()

    if flate_count == 0:
        print(
            "No FlateDecode streams were found."
        )
        return 2

    if unsupported_count > 0 or failed_count > 0:
        print(
            "REPAIR ABORTED."
        )
        print(
            "Not every Flate stream can be safely "
            "recovered automatically."
        )

        if OUTPUT_PDF.exists():
            OUTPUT_PDF.unlink()

        return 3

    if repaired_count == 0:
        print(
            "No malformed raw/gzip Flate streams "
            "were found."
        )
        print(
            "No repaired PDF was created."
        )
        return 4

    print("Creating repaired PDF...")

    writer = PdfWriter()

    writer.clone_document_from_reader(reader)

    with OUTPUT_PDF.open("wb") as output:
        writer.write(output)

    print()
    print("=" * 60)
    print("REPAIR COMPLETED")
    print("=" * 60)
    print(f"Output:")
    print(OUTPUT_PDF)
    print("=" * 60)

    return 0


if __name__ == "__main__":
    raise SystemExit(
        repair_company_pdf()
    )