import { useState } from "react";
import { Eye, UserRound, WalletCards } from "lucide-react";

import { useProfile } from "./hooks/useProfile";

import ProfileHeader from "./components/ProfileHeader/ProfileHeader";
import ProfileSummary from "./components/ProfileSummary/ProfileSummary";
import PersonalInfo from "./components/PersonalInfo/PersonalInfo";
import EmergencyContact from "./components/EmergencyContact/EmergencyContact";
import WorkInfo from "./components/WorkInfo/WorkInfo";
import BankInfo from "./components/BankInfo/BankInfo";
import FamilyInfo from "./components/FamilyInfo/FamilyInfo";
import EducationInfo from "./components/EducationInfo/EducationInfo";
import ExperienceInfo from "./components/ExperienceInfo/ExperienceInfo";
import PayrollBankTab from "./components/PayrollBankTab/PayrollBankTab";

import "./Profile.css";

type ProfileTab = "profile" | "payroll";

const Profile = (): JSX.Element => {
  const { profile, loading, error } = useProfile();

  const [activeTab, setActiveTab] =
    useState<ProfileTab>("profile");

  if (loading) {
    return (
      <div className="profile-page-state">
        Loading Profile Details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page-state profile-page-state--error">
        Error: {error}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page-state">
        No Profile Data Found
      </div>
    );
  }

  return (
    <main className="profile-page">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <header className="profile-page__top">

        <div className="profile-page__heading">

          <h1>My Profile</h1>

          <nav
            className="profile-breadcrumb"
            aria-label="Breadcrumb"
          >
            <span>Dashboard</span>

            <span aria-hidden="true">
              ›
            </span>

            <strong>My Profile</strong>

          </nav>

        </div>

        <button
          type="button"
          className="profile-view-button"
          aria-label="View profile as another user"
        >
          <Eye
            size={13}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <span>View As</span>

        </button>

      </header>

      {/* =====================================================
          PROFILE TABS
      ====================================================== */}

      <div
        className="profile-tabs"
        role="tablist"
        aria-label="Employee profile sections"
      >

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "profile"}
          className={`profile-tab ${
            activeTab === "profile"
              ? "profile-tab--active"
              : ""
          }`}
          onClick={() => setActiveTab("profile")}
        >

          <UserRound
            size={16}
            strokeWidth={1.8}
          />

          <span>Profile Information</span>

        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "payroll"}
          className={`profile-tab ${
            activeTab === "payroll"
              ? "profile-tab--active"
              : ""
          }`}
          onClick={() => setActiveTab("payroll")}
        >

          <WalletCards
            size={16}
            strokeWidth={1.8}
          />

          <span>Payroll & Bank</span>

        </button>

      </div>

      {/* =====================================================
          PROFILE INFORMATION TAB
      ====================================================== */}

      {activeTab === "profile" && (
        <div
          className="profile-tab-content"
          role="tabpanel"
          aria-label="Profile Information"
        >

          {/* =====================================================
              PROFILE HEADER
          ====================================================== */}

          <ProfileHeader
            profile={profile}
          />

          {/* =====================================================
              PROFILE SUMMARY
          ====================================================== */}

          <ProfileSummary
            items={profile.summary}
          />

          {/* =====================================================
              PROFILE INFORMATION GRID
          ====================================================== */}

          <section
            className="profile-information-grid"
            aria-label="Profile information"
          >

            {/* Row 1 */}

            <PersonalInfo
              fields={profile.personalInformation}
            />

            <EmergencyContact
              fields={profile.emergencyContact}
            />

            <WorkInfo
              fields={profile.workInformation}
            />

            {/* Row 2 */}

            <BankInfo
              fields={profile.bankInformation}
            />

            <FamilyInfo
              members={profile.familyInformation}
            />

            <EducationInfo
              records={profile.educationInformation}
            />

          </section>

          {/* =====================================================
              EXPERIENCE
          ====================================================== */}

          <ExperienceInfo
            records={profile.experienceInformation}
          />

          {/* =====================================================
              SAVE NOTE
          ====================================================== */}

          <footer className="profile-save-note">

            <span aria-hidden="true">
              ⓘ
            </span>

            <span>
              Changes are synced with the HRMS database.
            </span>

          </footer>

        </div>
      )}

      {/* =====================================================
          PAYROLL & BANK TAB
      ====================================================== */}

      {activeTab === "payroll" && (
        <div
          className="profile-tab-content profile-tab-content--payroll"
          role="tabpanel"
          aria-label="Payroll and Bank Information"
        >

          <PayrollBankTab />

        </div>
      )}

    </main>
  );
};

export default Profile;