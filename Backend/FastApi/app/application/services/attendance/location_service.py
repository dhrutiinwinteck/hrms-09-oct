import math
from typing import Optional

import httpx

from app.core.config import settings
from app.domain.interfaces.attendance.location_interface import (
    ILocationService,
)


class LocationService(ILocationService):
    # ============================================================
    # CALCULATE DISTANCE
    # ============================================================
    #
    # Kept for compatibility with existing code/interface.
    #
    # IMPORTANT:
    # This method is NOT used to allow or reject attendance.
    # Employees can punch in/out from anywhere.
    #
    # ============================================================

    @staticmethod
    def calculate_distance_meters(
        latitude1: float,
        longitude1: float,
        latitude2: float,
        longitude2: float,
    ) -> float:
        """
        Calculate distance between two GPS coordinates
        using the Haversine formula.

        This method is retained for compatibility only.

        Attendance punch-in/punch-out does NOT use
        office distance validation.
        """

        earth_radius = 6_371_000

        lat1 = math.radians(latitude1)
        lat2 = math.radians(latitude2)

        delta_lat = math.radians(
            latitude2 - latitude1
        )

        delta_lon = math.radians(
            longitude2 - longitude1
        )

        a = (
            math.sin(delta_lat / 2) ** 2
            + math.cos(lat1)
            * math.cos(lat2)
            * math.sin(delta_lon / 2) ** 2
        )

        c = 2 * math.atan2(
            math.sqrt(a),
            math.sqrt(1 - a),
        )

        return earth_radius * c

    # ============================================================
    # VALIDATE LOCATION
    # ============================================================

    def validate_location(
        self,
        latitude: float,
        longitude: float,
        accuracy: float,
    ) -> dict:
        """
        Validate the GPS coordinates.

        IMPORTANT:
        - No office geofence
        - No office radius check
        - No distance restriction
        - No maximum accuracy restriction

        Employees can punch in/out from anywhere.
        """

        # --------------------------------------------------------
        # Validate latitude
        # --------------------------------------------------------

        if not -90 <= latitude <= 90:
            raise ValueError(
                "Invalid latitude."
            )

        # --------------------------------------------------------
        # Validate longitude
        # --------------------------------------------------------

        if not -180 <= longitude <= 180:
            raise ValueError(
                "Invalid longitude."
            )

        # --------------------------------------------------------
        # Validate GPS accuracy
        # --------------------------------------------------------
        #
        # We only make sure accuracy is a valid positive number.
        #
        # Example:
        # accuracy = 159 meters
        #
        # This is still accepted.
        #
        # --------------------------------------------------------

        if accuracy <= 0:
            raise ValueError(
                "Invalid GPS accuracy."
            )

        return {
            "latitude": latitude,
            "longitude": longitude,
            "accuracy": round(accuracy, 2),
        }

    # ============================================================
    # GOOGLE REVERSE GEOCODING
    # ============================================================

    def reverse_geocode(
        self,
        latitude: float,
        longitude: float,
    ) -> Optional[str]:
        """
        Convert GPS coordinates into a human-readable address
        using Google Reverse Geocoding.

        IMPORTANT:
        If Google fails, attendance must NOT fail.

        The GPS coordinates are still saved and the address
        will simply be None.
        """

        # --------------------------------------------------------
        # Check whether Google geocoding is enabled
        # --------------------------------------------------------

        if not settings.GOOGLE_GEOCODING_ENABLED:
            print(
                "[GOOGLE GEOCODING] "
                "Disabled in settings"
            )
            return None

        # --------------------------------------------------------
        # Check API key
        # --------------------------------------------------------

        if not settings.GOOGLE_MAPS_API_KEY:
            print(
                "[GOOGLE GEOCODING] "
                "API key is missing"
            )
            return None

        # --------------------------------------------------------
        # Google Reverse Geocoding API
        # --------------------------------------------------------

        url = (
            "https://geocode.googleapis.com/"
            "v4/geocode/location"
        )

        params = {
            "location.latitude": latitude,
            "location.longitude": longitude,
            "key": settings.GOOGLE_MAPS_API_KEY,
            "languageCode": "en",
        }

        try:
            print(
                "[GOOGLE GEOCODING] "
                f"Requesting address for "
                f"lat={latitude}, "
                f"lon={longitude}"
            )

            # ----------------------------------------------------
            # Send request to Google
            # ----------------------------------------------------

            with httpx.Client(
                timeout=10.0
            ) as client:

                response = client.get(
                    url,
                    params=params,
                )

            # ----------------------------------------------------
            # Print Google HTTP status
            # ----------------------------------------------------

            print(
                "[GOOGLE GEOCODING] "
                f"HTTP Status: {response.status_code}"
            )

            # ----------------------------------------------------
            # Handle Google API errors
            # ----------------------------------------------------

            if response.status_code != 200:

                print(
                    "[GOOGLE GEOCODING] "
                    "Error response:"
                )

                print(response.text)

                return None

            # ----------------------------------------------------
            # Convert response to JSON
            # ----------------------------------------------------

            data = response.json()

            print(
                "[GOOGLE GEOCODING] "
                "Response received"
            )

            # ----------------------------------------------------
            # Get results
            # ----------------------------------------------------

            results = data.get(
                "results",
                []
            )

            if not results:

                print(
                    "[GOOGLE GEOCODING] "
                    "No results returned"
                )

                print(
                    "[GOOGLE GEOCODING] "
                    f"Full response: {data}"
                )

                return None

            # ----------------------------------------------------
            # Get first result
            # ----------------------------------------------------

            first_result = results[0]

            # ----------------------------------------------------
            # Google v4 normally returns formattedAddress
            # ----------------------------------------------------

            address = first_result.get(
                "formattedAddress"
            )

            # ----------------------------------------------------
            # Compatibility fallback
            # ----------------------------------------------------

            if not address:
                address = first_result.get(
                    "formatted_address"
                )

            # ----------------------------------------------------
            # Address not available
            # ----------------------------------------------------

            if not address:

                print(
                    "[GOOGLE GEOCODING] "
                    "formattedAddress not found"
                )

                print(
                    "[GOOGLE GEOCODING] "
                    f"First result: {first_result}"
                )

                return None

            # ----------------------------------------------------
            # Success
            # ----------------------------------------------------

            print(
                "[GOOGLE GEOCODING] "
                f"Address: {address}"
            )

            return address

        # --------------------------------------------------------
        # Network error
        # --------------------------------------------------------

        except httpx.RequestError as exc:

            print(
                "[GOOGLE GEOCODING] "
                f"Network error: {exc}"
            )

            return None

        # --------------------------------------------------------
        # JSON / unexpected error
        # --------------------------------------------------------

        except Exception as exc:

            print(
                "[GOOGLE GEOCODING] "
                f"Unexpected error: {exc}"
            )

            return None

    # ============================================================
    # PROCESS LOCATION
    # ============================================================

    def process_location(
        self,
        latitude: float,
        longitude: float,
        accuracy: float,
    ) -> dict:
        """
        Process the employee's live GPS location.

        Flow:

            Browser GPS
                 ↓
            Validate coordinates
                 ↓
            Google reverse geocoding
                 ↓
            Return GPS + address

        IMPORTANT:

        NO office distance calculation.
        NO office radius check.
        NO inside-office check.
        NO maximum GPS accuracy rejection.
        """

        # --------------------------------------------------------
        # Validate GPS
        # --------------------------------------------------------

        location = self.validate_location(
            latitude=latitude,
            longitude=longitude,
            accuracy=accuracy,
        )

        # --------------------------------------------------------
        # Resolve address using Google
        # --------------------------------------------------------
        #
        # Address is informational only.
        #
        # If Google fails, address becomes None.
        # Punch In / Punch Out must still continue.
        #
        # --------------------------------------------------------

        address = self.reverse_geocode(
            latitude=latitude,
            longitude=longitude,
        )

        # --------------------------------------------------------
        # Add address to location response
        # --------------------------------------------------------

        location["address"] = address

        return location