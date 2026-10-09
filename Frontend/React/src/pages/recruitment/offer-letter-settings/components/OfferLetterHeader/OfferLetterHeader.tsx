import "./OfferLetterHeader.css";

export default function OfferLetterHeader() {
  return (
    <header className="ol-page-header">
      <div className="ol-breadcrumb">
        <span>Recruitment</span>
        <span className="ol-breadcrumb-separator">/</span>
        <span>Offer Letter Settings</span>
      </div>

      <h1>Offer Letter Settings</h1>

      <p>Manage your offer letter template and company information.</p>
    </header>
  );
}