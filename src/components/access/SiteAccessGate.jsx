import {
  useEffect,
} from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useSiteAccess,
} from "../../context/SiteAccessContext";


function SiteAccessGate({
  children,
}) {
  const location =
    useLocation();


  const {
    active,
    loading,
    requestAccess,
  } =
    useSiteAccess();


  useEffect(() => {
    if (
      loading ||
      active
    ) {
      return;
    }


    requestAccess(
      `${location.pathname}${location.search}`
    );

  }, [
    active,
    loading,
    location.pathname,
    location.search,
    requestAccess,
  ]);


  if (loading) {
    return (
      <div className="site-access-loading">
        Loading...
      </div>
    );
  }


  if (active) {
    return children;
  }


  return (
    <Navigate
      to="/dashboard"
      replace
    />
  );
}


export default SiteAccessGate;