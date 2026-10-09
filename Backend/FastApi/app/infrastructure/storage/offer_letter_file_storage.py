from __future__ import annotations

import re
import uuid
from pathlib import Path
from typing import Final

from fastapi import HTTPException, UploadFile, status


class OfferLetterFileStorage:
    """
    Handles file storage for Offer Letter assets.

    All Offer Letter files are stored in a single directory:

        uploads/offer_letter/

    Supported file types:
        - PNG
        - JPG
        - JPEG
        - WEBP

    Supported assets:
        - Company Logo
        - HR Signature
        - HR Stamp

    Database values contain relative paths such as:

        uploads/offer_letter/logo_a1b2c3d4.png
        uploads/offer_letter/signature_e5f6g7h8.png
        uploads/offer_letter/stamp_i9j0k1l2.png
    """

    _UPLOAD_DIRECTORY_NAME: Final[str] = "uploads"
    _OFFER_LETTER_DIRECTORY_NAME: Final[str] = "offer_letter"

    _MAX_FILE_SIZE_BYTES: Final[int] = 5 * 1024 * 1024

    _ALLOWED_EXTENSIONS: Final[frozenset[str]] = frozenset(
        {
            ".png",
            ".jpg",
            ".jpeg",
            ".webp",
        }
    )

    _ALLOWED_CONTENT_TYPES: Final[frozenset[str]] = frozenset(
        {
            "image/png",
            "image/jpeg",
            "image/webp",
        }
    )

    _ASSET_PREFIXES: Final[frozenset[str]] = frozenset(
        {
            "logo",
            "signature",
            "stamp",
        }
    )

    def __init__(self) -> None:
        """
        Initialize Offer Letter file storage.

        The storage directory is resolved relative to the FastAPI
        application root.

        Expected structure:

            Backend/FastApi/
                app/
                uploads/
                    offer_letter/
        """

        self._application_root = Path(__file__).resolve().parents[3]

        self._storage_directory = (
            self._application_root
            / self._UPLOAD_DIRECTORY_NAME
            / self._OFFER_LETTER_DIRECTORY_NAME
        )

        self._storage_directory.mkdir(
            parents=True,
            exist_ok=True,
        )

    async def save_company_logo(
        self,
        file: UploadFile,
    ) -> str:
        """
        Save a company logo.

        Returns:
            Relative path suitable for storing in the database.
        """

        return await self._save_file(
            file=file,
            asset_type="logo",
        )

    async def save_signature(
        self,
        file: UploadFile,
    ) -> str:
        """
        Save an HR signature.

        Returns:
            Relative path suitable for storing in the database.
        """

        return await self._save_file(
            file=file,
            asset_type="signature",
        )

    async def save_stamp(
        self,
        file: UploadFile,
    ) -> str:
        """
        Save an HR stamp.

        Returns:
            Relative path suitable for storing in the database.
        """

        return await self._save_file(
            file=file,
            asset_type="stamp",
        )

    def delete_logo(
        self,
        file_path: str,
    ) -> None:
        """
        Delete a previously stored company logo.
        """

        self.delete_file(file_path)

    def delete_file(
        self,
        file_path: str,
    ) -> None:
        """
        Delete a stored Offer Letter file.

        Only files inside uploads/offer_letter are allowed to be
        deleted. This prevents accidental deletion of arbitrary
        files on the server.
        """

        if not file_path:
            return

        try:
            target_path = self._resolve_stored_file_path(file_path)
        except ValueError:
            return

        if not target_path.exists():
            return

        if not target_path.is_file():
            return

        try:
            target_path.unlink()
        except OSError as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete Offer Letter file.",
            ) from exc

    async def _save_file(
        self,
        file: UploadFile,
        asset_type: str,
    ) -> str:
        """
        Validate and save an Offer Letter file.
        """

        if asset_type not in self._ASSET_PREFIXES:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Invalid Offer Letter file type.",
            )

        self._validate_file_metadata(file)

        extension = self._get_file_extension(file)

        unique_file_name = (
            f"{asset_type}_{uuid.uuid4().hex}{extension}"
        )

        destination = self._storage_directory / unique_file_name

        try:
            await self._write_file(
                file=file,
                destination=destination,
            )
        except HTTPException:
            self._safe_delete_path(destination)
            raise
        except OSError as exc:
            self._safe_delete_path(destination)

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save Offer Letter file.",
            ) from exc
        except Exception as exc:
            self._safe_delete_path(destination)

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save Offer Letter file.",
            ) from exc
        finally:
            await file.close()

        return self._build_relative_path(unique_file_name)

    async def _write_file(
        self,
        file: UploadFile,
        destination: Path,
    ) -> None:
        """
        Write the uploaded file to disk while enforcing the maximum
        file-size limit.

        The file is written in chunks rather than loading the entire
        file into memory.
        """

        total_bytes = 0

        try:
            with destination.open("wb") as destination_file:
                while True:
                    chunk = await file.read(1024 * 1024)

                    if not chunk:
                        break

                    total_bytes += len(chunk)

                    if total_bytes > self._MAX_FILE_SIZE_BYTES:
                        raise HTTPException(
                            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                            detail=(
                                "Offer Letter file size must not "
                                "exceed 5 MB."
                            ),
                        )

                    destination_file.write(chunk)

        except HTTPException:
            self._safe_delete_path(destination)
            raise

    def _validate_file_metadata(
        self,
        file: UploadFile,
    ) -> None:
        """
        Validate filename and MIME type before saving.
        """

        if file is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File is required.",
            )

        original_filename = file.filename

        if not original_filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file must have a filename.",
            )

        filename = Path(original_filename).name

        if filename != original_filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid filename.",
            )

        extension = Path(filename).suffix.lower()

        if extension not in self._ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid file type. Allowed file types are "
                    "PNG, JPG, JPEG and WEBP."
                ),
            )

        content_type = (
            file.content_type.strip().lower()
            if file.content_type
            else ""
        )

        if content_type not in self._ALLOWED_CONTENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid content type. Allowed content types are "
                    "image/png, image/jpeg and image/webp."
                ),
            )

    def _get_file_extension(
        self,
        file: UploadFile,
    ) -> str:
        """
        Return a normalized file extension.
        """

        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file must have a filename.",
            )

        extension = Path(file.filename).suffix.lower()

        if extension not in self._ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file extension.",
            )

        return extension

    def _resolve_stored_file_path(
        self,
        file_path: str,
    ) -> Path:
        """
        Resolve a database-stored relative path safely.

        Only paths inside uploads/offer_letter are accepted.
        """

        normalized_path = file_path.strip()

        if not normalized_path:
            raise ValueError("File path cannot be empty.")

        normalized_path = normalized_path.replace(
            "\\",
            "/",
        )

        prefix = (
            f"{self._UPLOAD_DIRECTORY_NAME}/"
            f"{self._OFFER_LETTER_DIRECTORY_NAME}/"
        )

        if normalized_path.startswith(prefix):
            relative_file_name = normalized_path[
                len(prefix):
            ]
        else:
            # Backward compatibility:
            # If only a filename was stored in the database,
            # allow it as long as it is a simple filename.
            relative_file_name = normalized_path

        if not relative_file_name:
            raise ValueError("Invalid file path.")

        if "/" in relative_file_name:
            raise ValueError("Invalid file path.")

        if "\\" in relative_file_name:
            raise ValueError("Invalid file path.")

        if ".." in Path(relative_file_name).parts:
            raise ValueError("Invalid file path.")

        if not self._is_safe_filename(relative_file_name):
            raise ValueError("Invalid file name.")

        target_path = (
            self._storage_directory / relative_file_name
        ).resolve()

        storage_root = self._storage_directory.resolve()

        try:
            target_path.relative_to(storage_root)
        except ValueError as exc:
            raise ValueError(
                "File path is outside the Offer Letter storage directory."
            ) from exc

        return target_path

    @staticmethod
    def _is_safe_filename(
        filename: str,
    ) -> bool:
        """
        Validate a stored filename.

        Generated files follow:

            logo_<uuid>.png
            signature_<uuid>.png
            stamp_<uuid>.png
        """

        pattern = re.compile(
            r"^(logo|signature|stamp)_[a-f0-9]{32}\.(png|jpg|jpeg|webp)$",
            re.IGNORECASE,
        )

        return pattern.fullmatch(filename) is not None

    @staticmethod
    def _safe_delete_path(
        path: Path,
    ) -> None:
        """
        Delete a path without raising a secondary exception while
        handling an original file-storage failure.
        """

        try:
            if path.exists() and path.is_file():
                path.unlink()
        except OSError:
            pass

    def _build_relative_path(
        self,
        filename: str,
    ) -> str:
        """
        Build the database-safe relative path.
        """

        return (
            f"{self._UPLOAD_DIRECTORY_NAME}/"
            f"{self._OFFER_LETTER_DIRECTORY_NAME}/"
            f"{filename}"
        )