import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyEnquiries } from "../api/marketplaceApi";
import EnquiryStatusCard from "../components/marketplace/EnquiryStatusCard";
import "../styles/marketplace.css";

export default function MyEnquiriesPage() {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getMyEnquiries().then((data) => active && setEnquiries(data.enquiries || [])).catch((err) => active && setError(err?.message || "Unable to load enquiries.")).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return (
    <main className="marketplace-page">
      <header className="mk-page-heading"><div><h1>My enquiries</h1><p>Review your session requests and practitioner responses</p></div><button className="mk-outline-button" onClick={() => navigate("/marketplace")}>Browse practitioners</button></header>
      {error && <div className="mk-error-banner">{error}</div>}
      {loading ? <div className="mk-loading">Loading enquiries…</div> : <div className="mk-enquiry-list">{enquiries.map((enquiry) => <EnquiryStatusCard key={enquiry.id} enquiry={enquiry} onOpen={() => navigate(`/marketplace/enquiries/${enquiry.id}`)} />)}{!enquiries.length && <div className="mk-empty-state">You have not sent any enquiries yet.</div>}</div>}
    </main>
  );
}
