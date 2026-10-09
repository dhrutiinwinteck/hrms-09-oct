from __future__ import annotations

import argostranslate.translate

class ArgosTranslationError(RuntimeError):
    """Raised when Argos Translate fails."""

class ArgosTranslator:
    """
    Argos Translate provider.

    Supported translations:

        English -> Hindi
        English -> Bengali

    Language codes:

        en -> hi
        en -> bn
    """

    SOURCE_LANGUAGE = "en"

    SUPPORTED_TARGET_LANGUAGES = {
        "hi": "Hindi",
        "bn": "Bengali",
    }

    def translate(
        self,
        text: str,
        target_language: str,
    ) -> str:
        """
        Translate English text using Argos Translate.

        Args:
            text:
                English source text.

            target_language:
                Target language code.
                Supported:
                    hi = Hindi
                    bn = Bengali

        Returns:
            Translated text.

        Raises:
            ValueError:
                If the target language is unsupported.

            ArgosTranslationError:
                If Argos translation fails.
        """

        # ---------------------------------------------------------
        # Validate source text
        # ---------------------------------------------------------

        if not text or not text.strip():
            return text

        # ---------------------------------------------------------
        # Normalize language
        # ---------------------------------------------------------

        language = (
            target_language or ""
        ).strip().lower()

        # ---------------------------------------------------------
        # Validate target language
        # ---------------------------------------------------------

        if language not in self.SUPPORTED_TARGET_LANGUAGES:
            supported_languages = ", ".join(
                self.SUPPORTED_TARGET_LANGUAGES.keys()
            )

            raise ValueError(
                "Argos does not support target language "
                f"'{language}'. "
                f"Supported languages are: "
                f"{supported_languages}."
            )

        # ---------------------------------------------------------
        # Perform Argos translation
        # ---------------------------------------------------------

        try:
            translated_text = (
                argostranslate.translate.translate(
                    text,
                    self.SOURCE_LANGUAGE,
                    language,
                )
            )

        except Exception as exc:
            raise ArgosTranslationError(
                "Argos translation failed for "
                f"{self.SOURCE_LANGUAGE} -> {language}."
            ) from exc

        # ---------------------------------------------------------
        # Validate result
        # ---------------------------------------------------------

        if not translated_text or not translated_text.strip():
            raise ArgosTranslationError(
                "Argos returned empty translation for "
                f"{self.SOURCE_LANGUAGE} -> {language}."
            )

        return translated_text.strip()
