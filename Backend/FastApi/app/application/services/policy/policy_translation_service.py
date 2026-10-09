from __future__ import annotations

import logging
import re

from app.infrastructure.translation.argos_translator import (
    ArgosTranslationError,
    ArgosTranslator,
)


logger = logging.getLogger(__name__)


class PolicyTranslationService:
    """
    Policy translation service using Argos Translate.

    Supported:

        English -> Hindi
        English -> Bengali

    Translation happens in memory.

    Nothing is stored in the database.
    """

    SUPPORTED_LANGUAGES = {
        "hi": "Hindi",
        "bn": "Bengali",
    }

    SOURCE_LANGUAGE = "en"

    # Keep chunks reasonably small for Argos.
    MAX_TRANSLATION_CHARS = 4_000

    # ============================================================
    # INITIALIZATION
    # ============================================================

    def __init__(
        self,
        translator: ArgosTranslator | None = None,
    ) -> None:

        self.translator = (
            translator
            if translator is not None
            else ArgosTranslator()
        )

    # ============================================================
    # TRANSLATE POLICY
    # ============================================================

    def translate_policy_text(
        self,
        text: str,
        target_language: str,
    ) -> str:

        # ========================================================
        # NORMALIZE LANGUAGE
        # ========================================================

        language = (
            target_language or ""
        ).strip().lower()

        # ========================================================
        # VALIDATE LANGUAGE
        # ========================================================

        if language not in self.SUPPORTED_LANGUAGES:

            raise ValueError(
                "Unsupported translation language. "
                "Supported languages are: hi, bn."
            )

        # ========================================================
        # VALIDATE TEXT
        # ========================================================

        source_text = (
            text or ""
        ).strip()

        if not source_text:

            raise ValueError(
                "Policy content is empty."
            )

        # ========================================================
        # SPLIT CONTENT
        # ========================================================

        chunks = self._split_text(
            source_text
        )

        if not chunks:

            raise ValueError(
                "Policy content could not be "
                "prepared for translation."
            )

        logger.info(
            "Starting policy translation. "
            "language=%s total_chars=%s chunks=%s",
            language,
            len(source_text),
            len(chunks),
        )

        # ========================================================
        # TRANSLATE CHUNKS
        # ========================================================

        translated_chunks: list[str] = []

        for index, chunk in enumerate(
            chunks,
            start=1,
        ):

            try:

                logger.info(
                    "Translating policy chunk %s/%s. "
                    "language=%s chars=%s",
                    index,
                    len(chunks),
                    language,
                    len(chunk),
                )

                translated = (
                    self.translator.translate(
                        chunk,
                        language,
                    )
                )

                translated = (
                    translated or ""
                ).strip()

                if not translated:

                    raise ArgosTranslationError(
                        "Argos returned empty translation "
                        f"for chunk {index}."
                    )

                translated_chunks.append(
                    translated
                )

            except ArgosTranslationError as exc:

                logger.exception(
                    "Argos translation failed for policy chunk. "
                    "chunk=%s/%s language=%s chars=%s",
                    index,
                    len(chunks),
                    language,
                    len(chunk),
                )

                # Keep the REAL error.
                raise RuntimeError(
                    "Policy translation failed. "
                    f"Language: {language}. "
                    f"Chunk: {index}/{len(chunks)}. "
                    f"Reason: {exc}"
                ) from exc

            except Exception as exc:

                logger.exception(
                    "Unexpected translation error. "
                    "chunk=%s/%s language=%s",
                    index,
                    len(chunks),
                    language,
                )

                raise RuntimeError(
                    "Unexpected policy translation error. "
                    f"Language: {language}. "
                    f"Chunk: {index}/{len(chunks)}. "
                    f"Reason: {exc}"
                ) from exc

        # ========================================================
        # COMBINE TRANSLATIONS
        # ========================================================

        result = (
            "\n\n".join(
                translated_chunks
            )
            .strip()
        )

        if not result:

            raise RuntimeError(
                "Argos Translate returned empty policy content."
            )

        logger.info(
            "Policy translation completed successfully. "
            "language=%s translated_chars=%s",
            language,
            len(result),
        )

        return result

    # ============================================================
    # SPLIT LARGE CONTENT
    # ============================================================

    def _split_text(
        self,
        text: str,
    ) -> list[str]:

        # --------------------------------------------------------
        # Normalize line endings
        # --------------------------------------------------------

        normalized_text = (
            text.replace(
                "\r\n",
                "\n",
            )
            .replace(
                "\r",
                "\n",
            )
        )

        # --------------------------------------------------------
        # Split by paragraphs
        # --------------------------------------------------------

        paragraphs = [
            paragraph.strip()
            for paragraph in re.split(
                r"\n\s*\n",
                normalized_text,
            )
            if paragraph.strip()
        ]

        chunks: list[str] = []

        current_parts: list[str] = []
        current_length = 0

        # ========================================================
        # PROCESS PARAGRAPHS
        # ========================================================

        for paragraph in paragraphs:

            paragraph_length = len(
                paragraph
            )

            # ----------------------------------------------------
            # Normal paragraph
            # ----------------------------------------------------

            if (
                paragraph_length
                <= self.MAX_TRANSLATION_CHARS
            ):

                extra_length = (
                    paragraph_length
                    + (
                        2
                        if current_parts
                        else 0
                    )
                )

                if (
                    current_length
                    + extra_length
                    <= self.MAX_TRANSLATION_CHARS
                ):

                    current_parts.append(
                        paragraph
                    )

                    current_length += (
                        extra_length
                    )

                else:

                    if current_parts:

                        chunks.append(
                            "\n\n".join(
                                current_parts
                            )
                        )

                    current_parts = [
                        paragraph
                    ]

                    current_length = (
                        paragraph_length
                    )

                continue

            # ----------------------------------------------------
            # Flush existing chunk
            # ----------------------------------------------------

            if current_parts:

                chunks.append(
                    "\n\n".join(
                        current_parts
                    )
                )

                current_parts = []
                current_length = 0

            # ----------------------------------------------------
            # Split oversized paragraph
            # ----------------------------------------------------

            paragraph_chunks = (
                self._split_large_paragraph(
                    paragraph
                )
            )

            chunks.extend(
                paragraph_chunks
            )

        # ========================================================
        # FLUSH LAST CHUNK
        # ========================================================

        if current_parts:

            chunks.append(
                "\n\n".join(
                    current_parts
                )
            )

        return [
            chunk.strip()
            for chunk in chunks
            if chunk and chunk.strip()
        ]

    # ============================================================
    # SPLIT LARGE PARAGRAPH
    # ============================================================

    def _split_large_paragraph(
        self,
        paragraph: str,
    ) -> list[str]:

        chunks: list[str] = []

        remaining = paragraph.strip()

        while (
            len(remaining)
            > self.MAX_TRANSLATION_CHARS
        ):

            limit = self.MAX_TRANSLATION_CHARS

            # ----------------------------------------------------
            # Prefer sentence boundary
            # ----------------------------------------------------

            candidate = remaining[
                :limit
            ]

            sentence_breaks = [
                candidate.rfind(". "),
                candidate.rfind("? "),
                candidate.rfind("! "),
                candidate.rfind("। "),
            ]

            split_at = max(
                sentence_breaks
            )

            # ----------------------------------------------------
            # If no sentence boundary,
            # prefer whitespace
            # ----------------------------------------------------

            if split_at < 1:

                split_at = candidate.rfind(
                    " "
                )

            # ----------------------------------------------------
            # Absolute fallback
            # ----------------------------------------------------

            if split_at < 1:

                split_at = limit

            else:

                # Include punctuation but not
                # the following space.
                split_at += 1

            chunk = (
                remaining[:split_at]
                .strip()
            )

            if chunk:

                chunks.append(
                    chunk
                )

            remaining = (
                remaining[split_at:]
                .strip()
            )

        # --------------------------------------------------------
        # Remaining text
        # --------------------------------------------------------

        if remaining:

            chunks.append(
                remaining
            )

        return chunks