import {
  Building2,
  BriefcaseBusiness,
  Mail,
  Phone,
  UserRound,
  VenusAndMars,
} from "lucide-react";

import type { ProfileSummaryItem } from "../../types/profile.types.ts";

import "./ProfileSummary.css";

interface ProfileSummaryProps {
  items: ProfileSummaryItem[];
}

const ProfileSummary = ({
  items,
}: ProfileSummaryProps): JSX.Element => {
  const getIcon = (icon: string): JSX.Element => {
    switch (icon) {
      case "mail":
        return (
          <Mail
            size={13}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        );

      case "phone":
        return (
          <Phone
            size={13}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        );

      case "briefcase":
        return (
          <BriefcaseBusiness
            size={13}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        );

      case "building":
        return (
          <Building2
            size={13}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        );

      case "user":
        return (
          <UserRound
            size={13}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        );

      case "gender":
        return (
          <VenusAndMars
            size={13}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        );

      default:
        return (
          <UserRound
            size={13}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        );
    }
  };

  return (
    <section
      className="profile-summary"
      aria-label="Employee summary"
    >
      {items.map((item, index) => (
        <div
          className="profile-summary__item"
          key={`${item.label}-${index}`}
        >
          <div className="profile-summary__icon">
            {getIcon(item.icon)}
          </div>

          <div className="profile-summary__content">
            <span className="profile-summary__label">
              {item.label}
            </span>

            <strong className="profile-summary__value">
              {item.value}
            </strong>
          </div>
        </div>
      ))}
    </section>
  );
};

export default ProfileSummary;