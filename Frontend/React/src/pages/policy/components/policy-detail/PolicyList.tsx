import PolicyCard from './PolicyCard';

import type {
  Policy,
} from '../../types/policy.types';

import './PolicyList.css';


interface PolicyListProps {
  policies: Policy[];

  onReadPolicy: (
    policy: Policy,
  ) => void;

  onViewOriginal: (
    policy: Policy,
  ) => void;
}


const PolicyList = ({
  policies,
  onReadPolicy,
  onViewOriginal,
}: PolicyListProps): JSX.Element => {

  if (
    policies.length === 0
  ) {
    return (
      <section
        className="policy-list-empty"
        aria-label="Company policies"
      >
        <p>
          No policies are currently available.
        </p>
      </section>
    );
  }


  return (
    <section
      className="policy-list"
      aria-label="Company policies"
    >
      {policies.map(
        (
          policy,
          index,
        ) => (
          <PolicyCard
            key={policy.id}
            policy={policy}
            index={index}
            onReadPolicy={
              onReadPolicy
            }
            onViewOriginal={
              onViewOriginal
            }
          />
        ),
      )}
    </section>
  );
};


export default PolicyList;