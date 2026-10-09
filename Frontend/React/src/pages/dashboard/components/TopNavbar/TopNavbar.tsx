import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Calendar,
  ChevronDown,
  LogOut,
  UserRound,
  Gift,
  Copy,
  Check,
  X,
} from "lucide-react";

import { clearAuth } from "@/pages/auth/utils/authStorage";
import { getMyReferralLink } from "../../services/referral.service";

import "./TopNavbar.css";

interface UserProfile {
  full_name: string;
  designation: string;
  photo: string | null;
  emp_code: string;
  department: string | null;
}

const TopNavbar = (): JSX.Element => {
  const navigate = useNavigate();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] =
    useState<boolean>(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  const [isReferEarnOpen, setIsReferEarnOpen] =
    useState<boolean>(false);

  const [isReferralLinkCopied, setIsReferralLinkCopied] =
    useState<boolean>(false);

  const [referralLink, setReferralLink] =
    useState<string>("");

  const [isReferralLoading, setIsReferralLoading] =
    useState<boolean>(false);

  const [referralError, setReferralError] =
    useState<string>("");

  /**
   * =========================================================
   * FETCH LOGGED-IN EMPLOYEE PROFILE
   * =========================================================
   */
  useEffect(() => {
    const fetchProfile = async (): Promise<void> => {
      const empCode = localStorage.getItem("username");

      if (!empCode) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/api/v1/employees/profile/${encodeURIComponent(
            empCode,
          )}`,
        );

        if (response.ok) {
          const data: UserProfile = await response.json();

          setProfile(data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /**
   * =========================================================
   * PROFILE VALUES
   * =========================================================
   */
  const name = profile
    ? profile.full_name
    : loading
      ? "Loading..."
      : "Guest";

  const role = profile
    ? profile.designation
    : loading
      ? "Employee"
      : "Not Logged In";

  /**
   * =========================================================
   * PROFILE AVATAR
   * =========================================================
   */
  const avatar =
    profile?.photo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name,
    )}&background=0D9488&color=fff`;

  /**
   * =========================================================
   * PROFILE DROPDOWN
   * =========================================================
   */
  const toggleDropdown = (): void => {
    setIsProfileDropdownOpen((prev) => !prev);
  };

  /**
   * =========================================================
   * CALENDAR NAVIGATION
   * =========================================================
   *
   * According to your router:
   *
   * /holidays/calendar
   *
   * opens HolidayCalendarPage.
   */
  const handleCalendar = (): void => {
    setIsProfileDropdownOpen(false);

    navigate("/holidays/calendar");
  };

  /**
   * =========================================================
   * LOGOUT
   * =========================================================
   */
  const handleLogout = (): void => {
    localStorage.clear();

    clearAuth();

    setIsProfileDropdownOpen(false);

    navigate("/login");
  };

  /**
   * =========================================================
   * MY PROFILE
   * =========================================================
   */
  const handleMyProfile = (): void => {
    setIsProfileDropdownOpen(false);

    navigate("/dashboard/profile");
  };

  /**
   * =========================================================
   * REFER & EARN
   * =========================================================
   */
  const handleReferAndEarn = async (): Promise<void> => {
    setIsReferEarnOpen(true);

    setIsReferralLinkCopied(false);

    setReferralError("");

    if (referralLink) {
      return;
    }

    try {
      setIsReferralLoading(true);

      const data = await getMyReferralLink();

      const fullReferralUrl =
        `${window.location.origin}${data.referralUrl}`;

      setReferralLink(fullReferralUrl);
    } catch (error) {
      console.error(
        "Failed to load referral link:",
        error,
      );

      setReferralError(
        "Unable to load your referral link. Please try again.",
      );
    } finally {
      setIsReferralLoading(false);
    }
  };

  /**
   * =========================================================
   * CLOSE REFER & EARN
   * =========================================================
   */
  const handleCloseReferAndEarn = (): void => {
    setIsReferEarnOpen(false);

    setIsReferralLinkCopied(false);
  };

  /**
   * =========================================================
   * COPY REFERRAL LINK
   * =========================================================
   */
  const handleCopyReferralLink = async (): Promise<void> => {
    if (!referralLink) {
      return;
    }

    try {
      /**
       * Modern Clipboard API
       */
      if (
        navigator.clipboard &&
        typeof navigator.clipboard.writeText ===
          "function"
      ) {
        try {
          await navigator.clipboard.writeText(
            referralLink,
          );

          setIsReferralLinkCopied(true);

          window.setTimeout(() => {
            setIsReferralLinkCopied(false);
          }, 2000);

          return;
        } catch (clipboardError) {
          console.warn(
            "Clipboard API failed. Trying fallback copy method.",
            clipboardError,
          );
        }
      }

      /**
       * Fallback copy method
       */
      const textArea =
        document.createElement("textarea");

      textArea.value = referralLink;

      textArea.setAttribute("readonly", "");

      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      textArea.style.width = "1px";
      textArea.style.height = "1px";
      textArea.style.opacity = "0";
      textArea.style.pointerEvents = "none";

      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      const copySuccessful =
        document.execCommand("copy");

      document.body.removeChild(textArea);

      if (!copySuccessful) {
        throw new Error(
          "Browser copy operation was unsuccessful.",
        );
      }

      setIsReferralLinkCopied(true);

      window.setTimeout(() => {
        setIsReferralLinkCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Failed to copy referral link:",
        error,
      );

      setIsReferralLinkCopied(false);

      const referralInput =
        document.getElementById(
          "referral-link",
        ) as HTMLInputElement | null;

      if (referralInput) {
        referralInput.focus();

        referralInput.select();
      }
    }
  };

  /**
   * =========================================================
   * RENDER
   * =========================================================
   */
  return (
    <>
      {/* =====================================================
          TOP NAVBAR
          ===================================================== */}
      <header className="top-navbar">
        {/* ===================================================
            LEFT SECTION
            =================================================== */}
        <div className="top-navbar-left">
          <div className="search-wrapper">
            <Search
              className="search-icon"
              size={20}
              strokeWidth={2}
              aria-hidden="true"
            />

            <input
              type="text"
              className="search-input"
              placeholder="Search employees, reports, documents etc."
              aria-label="Global Search"
            />
          </div>
        </div>

        {/* ===================================================
            RIGHT SECTION
            =================================================== */}
        <div className="top-navbar-right">
          {/* =================================================
              CALENDAR
              ================================================= */}
          <button
            type="button"
            className="icon-button"
            aria-label="Calendar"
            onClick={handleCalendar}
          >
            <Calendar
              size={22}
              strokeWidth={2}
              aria-hidden="true"
            />
          </button>

          {/* =================================================
              REFER & EARN
              ================================================= */}
          <button
            type="button"
            className="refer-earn-button"
            aria-label="Refer and Earn"
            onClick={handleReferAndEarn}
          >
            <span className="refer-earn-icon">
              <Gift
                size={19}
                strokeWidth={2}
                aria-hidden="true"
              />
            </span>

            <span className="refer-earn-text">
              Refer & Earn
            </span>
          </button>

          {/* =================================================
              PROFILE
              ================================================= */}
          <div
            className="profile-section"
            onClick={toggleDropdown}
            role="button"
            tabIndex={0}
            aria-haspopup="menu"
            aria-expanded={isProfileDropdownOpen}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                event.preventDefault();

                toggleDropdown();
              }
            }}
          >
            <img
              src={avatar}
              alt={name}
              className="profile-avatar"
            />

            <div className="profile-info">
              <span className="profile-name">
                {name}
              </span>

              <span className="profile-role">
                {role}
              </span>
            </div>

            <ChevronDown
              className={`profile-dropdown-icon ${
                isProfileDropdownOpen
                  ? "rotated"
                  : ""
              }`}
              size={18}
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>

          {/* =================================================
              PROFILE DROPDOWN
              ================================================= */}
          {isProfileDropdownOpen && (
            <div
              className="profile-dropdown"
              role="menu"
              aria-label="Profile menu"
            >
              {/* My Profile */}
              <button
                type="button"
                className="dropdown-item"
                role="menuitem"
                onClick={handleMyProfile}
              >
                <UserRound
                  size={18}
                  strokeWidth={2}
                  aria-hidden="true"
                />

                <span>My Profile</span>
              </button>

              {/* Logout */}
              <button
                type="button"
                className="dropdown-item logout-red"
                role="menuitem"
                onClick={handleLogout}
              >
                <LogOut
                  size={18}
                  strokeWidth={2}
                  aria-hidden="true"
                />

                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* =====================================================
          REFER & EARN MODAL
          ===================================================== */}
      {isReferEarnOpen && (
        <div
          className="refer-earn-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              handleCloseReferAndEarn();
            }
          }}
        >
          <div
            className="refer-earn-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="refer-earn-title"
          >
            {/* =================================================
                MODAL HEADER
                ================================================= */}
            <div className="refer-earn-modal-header">
              <div className="refer-earn-title-wrapper">
                <div className="refer-earn-title-icon">
                  <Gift
                    size={21}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h2 id="refer-earn-title">
                    Refer & Earn
                  </h2>

                  <p>
                    Share your referral link
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="refer-earn-close-button"
                aria-label="Close Refer and Earn"
                onClick={handleCloseReferAndEarn}
              >
                <X
                  size={19}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* =================================================
                MODAL BODY
                ================================================= */}
            <div className="refer-earn-modal-body">
              <div className="refer-earn-description">
                <p>
                  Refer a candidate using your personal
                  referral link and earn rewards when
                  eligible.
                </p>
              </div>

              <label
                htmlFor="referral-link"
                className="refer-earn-label"
              >
                Your Referral Link
              </label>

              <div className="referral-link-wrapper">
                <input
                  id="referral-link"
                  type="text"
                  value={
                    isReferralLoading
                      ? "Generating your referral link..."
                      : referralLink
                  }
                  readOnly
                  aria-label="Your referral link"
                  className="referral-link-input"
                  onFocus={(event) => {
                    event.currentTarget.select();
                  }}
                />

                <button
                  type="button"
                  className={`referral-copy-inline-button ${
                    isReferralLinkCopied
                      ? "copied"
                      : ""
                  }`}
                  onClick={
                    handleCopyReferralLink
                  }
                  disabled={
                    isReferralLoading ||
                    !referralLink
                  }
                  aria-label={
                    isReferralLinkCopied
                      ? "Referral link copied"
                      : "Copy referral link"
                  }
                >
                  {isReferralLinkCopied ? (
                    <>
                      <Check
                        size={16}
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />

                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy
                        size={16}
                        strokeWidth={2}
                        aria-hidden="true"
                      />

                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {referralError && (
                <p className="referral-error">
                  {referralError}
                </p>
              )}

              <div className="refer-earn-actions">
                <button
                  type="button"
                  className="refer-action-button refer-copy-button"
                  onClick={
                    handleCopyReferralLink
                  }
                  disabled={
                    isReferralLoading ||
                    !referralLink
                  }
                >
                  {isReferralLinkCopied ? (
                    <Check
                      size={17}
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                  ) : (
                    <Copy
                      size={17}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  )}

                  <span>
                    {isReferralLinkCopied
                      ? "Link Copied"
                      : "Copy Link"}
                  </span>
                </button>
              </div>

              <div className="refer-earn-info">
                <Gift
                  size={17}
                  strokeWidth={2}
                  aria-hidden="true"
                />

                <span>
                  Your referral will automatically be
                  linked to your account when the
                  candidate submits the application.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopNavbar;