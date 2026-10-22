import { useEffect, useState } from "react";
import MarketplacePage from "./MarketplacePage";
import PractitionerMarketplacePage from "./PractitionerMarketplacePage";
import { getPractitionerProfile } from "../api/practitionerMarketplaceApi";

export default function MarketplaceEntryPage() {
  const [role, setRole] = useState("loading");
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    const detect = async () => {
      try {
        const data = await getPractitionerProfile();
        if (!alive) return;
        setProfile(data?.practitioner || null);
        setRole("practitioner");
      } catch (err) {
        if (!alive) return;
        if (err?.status === 403 || err?.status === 404) {
          setRole("user");
          return;
        }
        setError(err?.data?.message || err?.message || "Unable to open marketplace.");
        setRole("error");
      }
    };

    detect();
    return () => { alive = false; };
  }, []);

  if (role === "loading") {
    return <div className="marketplace-page"><div className="mk-loading">Loading marketplace...</div></div>;
  }

  if (role === "error") {
    return <div className="marketplace-page"><div className="mk-error-banner">{error}</div></div>;
  }

  if (role === "practitioner") {
    return <PractitionerMarketplacePage initialProfile={profile} />;
  }

  return <MarketplacePage />;
}
