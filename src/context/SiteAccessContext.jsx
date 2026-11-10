import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  activateMySiteAccess,
  getMySiteAccess,
} from "../api/siteAccessApi";

import {
  getStoredToken,
} from "../utils/storage";


const SiteAccessContext =
  createContext(null);


/* =====================================================
   PROVIDER
   ===================================================== */

export function SiteAccessProvider({
  children,
}) {
  const navigate =
    useNavigate();

  const location =
    useLocation();


  const [
    access,
    setAccess,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    activating,
    setActivating,
  ] = useState(false);

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    pendingPath,
    setPendingPath,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");


  /* ===================================================
     LOAD ACCESS STATUS
     =================================================== */

  const refreshAccess =
    useCallback(
      async () => {
        const token =
          getStoredToken();


        if (!token) {
          setAccess(null);
          setLoading(false);

          return null;
        }


        try {
          setLoading(true);
          setError("");


          const result =
            await getMySiteAccess();


          setAccess(
            result || null
          );


          return result;

        } catch (loadError) {
          console.error(
            "Unable to load site access:",
            loadError
          );


          setAccess(null);


          return null;

        } finally {
          setLoading(false);
        }
      },
      []
    );


  /* ===================================================
     LOAD WHEN LOGGED-IN ROUTE CHANGES
     =================================================== */

  useEffect(() => {
    refreshAccess();
  }, [
    location.pathname,
    refreshAccess,
  ]);


  /* ===================================================
     REFRESH WHEN TOKEN BALANCE CHANGES
     =================================================== */

  useEffect(() => {
    function handleTokenUpdate() {
      refreshAccess();
    }


    window.addEventListener(
      "anandam:tokens-updated",
      handleTokenUpdate
    );


    return () => {
      window.removeEventListener(
        "anandam:tokens-updated",
        handleTokenUpdate
      );
    };
  }, [
    refreshAccess,
  ]);


  /* ===================================================
     OPEN ACCESS MODAL
     =================================================== */

  const requestAccess =
    useCallback(
      (
        destination = null
      ) => {
        setPendingPath(
          destination
        );

        setError("");

        setModalOpen(
          true
        );
      },
      []
    );


  /* ===================================================
     CLOSE ACCESS MODAL
     =================================================== */

  const closeAccessModal =
    useCallback(
      () => {
        if (activating) {
          return;
        }


        setModalOpen(
          false
        );

        setPendingPath(
          null
        );

        setError("");
      },
      [
        activating,
      ]
    );


  /* ===================================================
     ACTIVATE 30-DAY ACCESS
     =================================================== */

  const activateAccess =
    useCallback(
      async () => {
        try {
          setActivating(
            true
          );

          setError("");


          const updated =
            await activateMySiteAccess();


          setAccess(
            updated
          );


          /*
            Refresh token amount in AppHeader.
          */

          window.dispatchEvent(
            new Event(
              "anandam:tokens-updated"
            )
          );


          const destination =
            pendingPath;


          setModalOpen(
            false
          );

          setPendingPath(
            null
          );


          if (destination) {
            navigate(
              destination
            );
          }


          return updated;

        } catch (activateError) {
          console.error(
            "Site access activation failed:",
            activateError
          );


          setError(
            activateError?.message ||
            "Unable to activate Anandam access."
          );


          throw activateError;

        } finally {
          setActivating(
            false
          );
        }
      },
      [
        navigate,
        pendingPath,
      ]
    );


  /* ===================================================
     ACCESS STATE
     =================================================== */

  const active =
    Boolean(
      access?.active === true ||
      access?.accessType ===
        "ROLE_BYPASS"
    );


  const value =
    useMemo(
      () => ({
        access,

        active,

        loading,

        activating,

        modalOpen,

        pendingPath,

        error,

        setError,

        refreshAccess,

        requestAccess,

        closeAccessModal,

        activateAccess,
      }),
      [
        access,
        active,
        loading,
        activating,
        modalOpen,
        pendingPath,
        error,
        refreshAccess,
        requestAccess,
        closeAccessModal,
        activateAccess,
      ]
    );


  return (
    <SiteAccessContext.Provider
      value={value}
    >
      {children}
    </SiteAccessContext.Provider>
  );
}


/* =====================================================
   HOOK

   IMPORTANT:
   This named export fixes your current blank-screen error.
   ===================================================== */

export function useSiteAccess() {
  const context =
    useContext(
      SiteAccessContext
    );


  if (!context) {
    throw new Error(
      "useSiteAccess must be used inside SiteAccessProvider."
    );
  }


  return context;
}


export default SiteAccessContext;