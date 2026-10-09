// import {
//   Camera,
//   CalendarDays,
//   MapPin,
//   UserRound,
// } from "lucide-react";

// import type { ProfileData } from "../../types/profile.types.ts";

// import profileHeaderBackground from "../../../../assets/images/profile/profile-header-bg.png";

// import "./ProfileHeader.css";

// interface ProfileHeaderProps {
//   profile: ProfileData;
// }

// const ProfileHeader = ({
//   profile,
// }: ProfileHeaderProps): JSX.Element => {
//   return (
//     <section
//       className="profile-header"
//       aria-label="Employee profile header"
//     >
//       {/* =====================================================
//           DECORATIVE BACKGROUND
//       ====================================================== */}

//       <div
//         className="profile-header__decor"
//         aria-hidden="true"
//       >
//         {/* ===================================================
//             AVATAR SIDE ORGANIC SHAPES
//         ==================================================== */}

//         <span className="profile-header__avatar-blob" />

//         <span className="profile-header__avatar-soft-shadow" />

//         <span className="profile-header__avatar-bottom-shadow" />

//         {/* ===================================================
//             CENTER FLOWING PAPER SHAPES
//         ==================================================== */}

//         <span className="profile-header__center-wave" />

//         <span className="profile-header__center-wave-soft" />

//         {/* ===================================================
//             RIGHT SIDE ORGANIC SHAPES
//         ==================================================== */}

//         <span className="profile-header__right-blob" />

//         <span className="profile-header__right-blob-soft" />

//         {/* ===================================================
//             SUBTLE FLOWING LINE
//         ==================================================== */}

//         <span className="profile-header__flow-line" />

//         {/* ===================================================
//             DOT PATTERN
//         ==================================================== */}

//         <span className="profile-header__dots" />
//       </div>

//       {/* =====================================================
//           RIGHT SIDE PNG
//       ====================================================== */}

//       <img
//         src={profileHeaderBackground}
//         alt=""
//         className="profile-header__background-image"
//         aria-hidden="true"
//       />

//       {/* =====================================================
//           SOFT CONTENT PROTECTION
//       ====================================================== */}

//       <div
//         className="profile-header__soft-overlay"
//         aria-hidden="true"
//       />

//       {/* =====================================================
//           MAIN CONTENT
//       ====================================================== */}

//       <div className="profile-header__content">
//         {/* ===================================================
//             PROFILE AVATAR
//         ==================================================== */}

//         <div className="profile-header__avatar-area">
//           {/* Organic shadow directly behind avatar */}

//           <span
//             className="profile-header__avatar-local-shadow"
//             aria-hidden="true"
//           />

//           <div className="profile-header__avatar-wrapper">
//             <div
//               className="profile-header__avatar"
//               aria-label={`Profile avatar for ${profile.name}`}
//             >
//               {profile.initials}
//             </div>

//             <button
//               type="button"
//               className="profile-header__camera"
//               aria-label="Change profile photo"
//             >
//               <Camera
//                 size={13}
//                 strokeWidth={2}
//                 aria-hidden="true"
//               />
//             </button>
//           </div>
//         </div>

//         {/* ===================================================
//             EMPLOYEE INFORMATION
//         ==================================================== */}

//         <div className="profile-header__identity">
//           {/* Name + Status */}

//           <div className="profile-header__name-row">
//             <h2>{profile.name}</h2>

//             <span className="profile-header__status">
//               <span
//                 className="profile-header__status-dot"
//                 aria-hidden="true"
//               />

//               {profile.status}
//             </span>
//           </div>

//           {/* Designation */}

//           <p className="profile-header__designation">
//             {profile.designation}
//           </p>

//           {/* Divider */}

//           <div
//             className="profile-header__divider"
//             aria-hidden="true"
//           />

//           {/* =================================================
//               EMPLOYEE META INFORMATION
//           ================================================== */}

//           <div className="profile-header__meta">
//             {/* Employee ID */}

//             <div className="profile-header__meta-item">
//               <div
//                 className="profile-header__meta-icon"
//                 aria-hidden="true"
//               >
//                 <UserRound
//                   size={14}
//                   strokeWidth={1.7}
//                 />
//               </div>

//               <div className="profile-header__meta-content">
//                 <span>Employee ID</span>

//                 <strong>
//                   {profile.employeeId}
//                 </strong>
//               </div>
//             </div>

//             {/* Date Of Joining */}

//             <div className="profile-header__meta-item">
//               <div
//                 className="profile-header__meta-icon"
//                 aria-hidden="true"
//               >
//                 <CalendarDays
//                   size={14}
//                   strokeWidth={1.7}
//                 />
//               </div>

//               <div className="profile-header__meta-content">
//                 <span>Date of Joining</span>

//                 <strong>
//                   {profile.dateOfJoining}
//                 </strong>
//               </div>
//             </div>

//             {/* Work Location */}

//             <div className="profile-header__meta-item">
//               <div
//                 className="profile-header__meta-icon"
//                 aria-hidden="true"
//               >
//                 <MapPin
//                   size={14}
//                   strokeWidth={1.7}
//                 />
//               </div>

//               <div className="profile-header__meta-content">
//                 <span>Work Location</span>

//                 <strong>
//                   {profile.workLocation}
//                 </strong>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default ProfileHeader;


import { Camera, CalendarDays, MapPin, UserRound } from "lucide-react";
import type { ProfileData } from "../../types/profile.types";
import profileHeaderBackground from "../../../../assets/images/profile/profile-header-bg.png";
import "./ProfileHeader.css";

const ProfileHeader = ({ profile }: { profile: ProfileData }) => {
  return (
    <section className="profile-header">
      <div className="profile-header__decor"><span className="profile-header__dots" /></div>
      <img src={profileHeaderBackground} alt="" className="profile-header__background-image" />
      <div className="profile-header__content">
        <div className="profile-header__avatar-area">
          <div className="profile-header__avatar-wrapper">
            <div className="profile-header__avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d9488', color: 'white' }}>
              {profile.photo ? (
                <img src={profile.photo} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                profile.initials
              )}
            </div>
            <button className="profile-header__camera"><Camera size={13} /></button>
          </div>
        </div>

        <div className="profile-header__identity">
          <div className="profile-header__name-row">
            <h2>{profile.name}</h2>
            <span className="profile-header__status"><span className="profile-header__status-dot" /> {profile.status}</span>
          </div>
          <p className="profile-header__designation">{profile.designation}</p>
          <div className="profile-header__divider" />
          <div className="profile-header__meta">
            <div className="profile-header__meta-item">
              <UserRound size={14} />
              <div className="profile-header__meta-content"><span>Employee ID</span> <strong>{profile.employeeId}</strong></div>
            </div>
            <div className="profile-header__meta-item">
              <CalendarDays size={14} />
              <div className="profile-header__meta-content"><span>Date of Joining</span> <strong>{profile.dateOfJoining}</strong></div>
            </div>
            <div className="profile-header__meta-item">
              <MapPin size={14} />
              <div className="profile-header__meta-content"><span>Work Location</span> <strong>{profile.workLocation}</strong></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileHeader;