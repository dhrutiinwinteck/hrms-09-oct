// import React from 'react';
// import './JoiningApprovalsHeader.css';

// // Keep the existing image path unchanged.
// import joiningApprovalImg from '../../../../../assets/images/joining approval/joining approval.png';

// export const JoiningApprovalsHeader: React.FC = () => {
//   return (
//     <section className="joining-approvals-header">
//       <div className="joining-approvals-header__content">
//         <div className="joining-approvals-header__left">
//           <h1 className="joining-approvals-header__title">
//             Joining Approvals
//           </h1>

//           <p className="joining-approvals-header__description">
//             Review and take action on new joining requests. You can accept,
//             reject or put a request on hold.
//           </p>
//         </div>

//         <div className="joining-approvals-header__right">
//           <div className="joining-approvals-header__image-wrapper">
//             <img
//               src={joiningApprovalImg}
//               alt="Joining Approvals"
//               className="joining-approvals-header__image"
//             />
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };


import React from 'react';
import './JoiningApprovalsHeader.css';

// Keep the existing image path unchanged.
import joiningApprovalImg from '../../../../../assets/images/joining approval/joining approval.png';

export const JoiningApprovalsHeader: React.FC = () => {
  return (
    <section
      className="joining-approvals-header"
      aria-labelledby="joining-approvals-title"
    >
      <div className="joining-approvals-header__content">
        {/* Decorative background */}
        <div
          className="joining-approvals-header__decor joining-approvals-header__decor--one"
          aria-hidden="true"
        />

        <div
          className="joining-approvals-header__decor joining-approvals-header__decor--two"
          aria-hidden="true"
        />

        {/* Content */}
        <div className="joining-approvals-header__left">
          <span className="joining-approvals-header__eyebrow">
            RECRUITMENT
          </span>

          <h1
            id="joining-approvals-title"
            className="joining-approvals-header__title"
          >
            Joining Approvals
          </h1>

          <p className="joining-approvals-header__description">
            Review and take action on new joining requests.
            <br className="joining-approvals-header__desktop-break" />
            <span className="joining-approvals-header__description-secondary">
              Click on a candidate to view full details and manage approvals.
            </span>
          </p>
        </div>

        {/* Illustration */}
        <div className="joining-approvals-header__right" aria-hidden="true">
          <div className="joining-approvals-header__image-wrapper">
            <img
              src={joiningApprovalImg}
              alt=""
              className="joining-approvals-header__image"
            />
          </div>
        </div>
      </div>
    </section>
  );
};