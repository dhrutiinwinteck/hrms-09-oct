import './WelcomeBanner.css';
import illustrationImage from '../../../../assets/images/dashboard/plant-top.png';
import { DASHBOARD_THOUGHTS } from '../../constants/dashboardThoughts';

interface WelcomeBannerProps {
  greeting: string;
  employeeName: string;
}

/**
 * Returns the motivational thought based on the current
 * day of the month.
 *
 * 1st  -> Thought 1
 * 2nd -> Thought 2
 * ...
 * 31st -> Thought 31
 */
const getDailyThought = (): string => {
  const dayOfMonth = new Date().getDate();

  return DASHBOARD_THOUGHTS[dayOfMonth - 1];
};

const WelcomeBanner = ({
  greeting,
  employeeName,
}: WelcomeBannerProps): JSX.Element => {
  const dailyThought = getDailyThought();

  return (
    <section className="welcome-banner">
      <div className="welcome-banner-content">
        <div className="welcome-banner-text">
          <h1 className="welcome-greeting">
            {greeting}, {employeeName}{' '}
            <span className="welcome-greeting-emoji">👋</span>
          </h1>

          <p className="welcome-message">
            {dailyThought}
          </p>
        </div>

        <img
          src={illustrationImage}
          alt="Office decor illustration"
          className="welcome-banner-image1"
        />
      </div>
    </section>
  );
};

export default WelcomeBanner;