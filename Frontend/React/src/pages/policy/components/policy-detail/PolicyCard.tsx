import {
  Eye,
  FileText,
} from 'lucide-react';

import type {
  Policy,
} from '../../types/policy.types';

import './PolicyCard.css';


interface PolicyCardProps {
  policy: Policy;

  index: number;

  onReadPolicy: (
    policy: Policy,
  ) => void;

  onViewOriginal: (
    policy: Policy,
  ) => void;
}


const PolicyCard = ({
  policy,
  index,
  onReadPolicy,
  onViewOriginal,
}: PolicyCardProps): JSX.Element => {
  return (
    <article className="policy-card">

      {/* =====================================================
          LEFT CONTENT
      ===================================================== */}

      <div className="policy-card-left">

        <div
          className="policy-card-icon"
          aria-hidden="true"
        >
          <FileText
            size={20}
            strokeWidth={1.8}
          />
        </div>

        <div className="policy-card-content">

          <h3 className="policy-card-title">

            <span className="policy-card-number">
              {index + 1}.
            </span>

            <span>
              {policy.title}
            </span>

          </h3>

          <p className="policy-card-description">
            {policy.description ||
              'No description available.'}
          </p>

        </div>

      </div>


      {/* =====================================================
          ACTIONS
      ===================================================== */}

      <div className="policy-card-action">

        {/* =================================================
            VIEW ORIGINAL DOCUMENT
        ================================================= */}

        <button
          type="button"
          className="policy-card-button policy-card-view-button"
          onClick={() =>
            onViewOriginal(policy)
          }
          disabled={!policy.documentUrl}
          aria-label={`View original document for ${policy.title}`}
          title={
            policy.documentUrl
              ? 'View original document'
              : 'Document unavailable'
          }
        >
          <Eye
            size={15}
            strokeWidth={1.8}
          />

          <span>
            View
          </span>
        </button>


        {/* =================================================
            READ POLICY
        ================================================= */}

        <button
          type="button"
          className="policy-card-button policy-card-read-button"
          onClick={() =>
            onReadPolicy(policy)
          }
          aria-label={`Read ${policy.title}`}
        >
          <FileText
            size={15}
            strokeWidth={1.8}
          />

          <span>
            Read Policy
          </span>
        </button>

      </div>

    </article>
  );
};


export default PolicyCard;