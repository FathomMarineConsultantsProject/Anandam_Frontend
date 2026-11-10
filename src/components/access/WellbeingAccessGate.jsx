import {
  useEffect,
} from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useWellbeingAccess,
} from "../../context/WellbeingAccessContext";


function WellbeingAccessGate({
  children,
}) {
  const location =
    useLocation();

  const {
    entryGranted,
    siteAccessActive,
    siteAccessLoading,
    requestWellbeingAccess,
  } = useWellbeingAccess();


  useEffect(() => {
    if (
      entryGranted ||
      siteAccessActive ||
      siteAccessLoading
    ) {
      return;
    }

    requestWellbeingAccess(
      `${location.pathname}${location.search}`
    );
  }, [
    entryGranted,
    siteAccessActive,
    siteAccessLoading,
    location.pathname,
    location.search,
    requestWellbeingAccess,
  ]);


  if (
    entryGranted ||
    siteAccessActive
  ) {
    return children;
  }


  if (siteAccessLoading) {
    return (
      <div className="site-access-loading">
        Loading...
      </div>
    );
  }


  /*
    A direct Wellbeing URL was opened without access.
    Return to the free dashboard while the global
    1-token Wellbeing popup remains open.
  */
  return (
    <Navigate
      to="/dashboard"
      replace
    />
  );
}


export default WellbeingAccessGate;
