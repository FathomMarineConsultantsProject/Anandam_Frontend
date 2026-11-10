import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  unlockWellbeingAccess,
} from "../api/wellbeingQuestionnaireApi";

import {
  useSiteAccess,
} from "./SiteAccessContext";


const WellbeingAccessContext =
  createContext(null);


const ENTRY_STORAGE_KEY =
  "anandam:wellbeing-entry-access";


function isWellbeingPath(pathname = "") {
  return (
    pathname === "/app/wellbeing" ||
    pathname.startsWith(
      "/app/wellbeing/"
    )
  );
}


function readStoredEntryGrant() {
  try {
    return (
      window.sessionStorage.getItem(
        ENTRY_STORAGE_KEY
      ) === "granted"
    );
  } catch {
    return false;
  }
}


function storeEntryGrant() {
  try {
    window.sessionStorage.setItem(
      ENTRY_STORAGE_KEY,
      "granted"
    );
  } catch {
    // Ignore browser storage failures.
  }
}


function removeStoredEntryGrant() {
  try {
    window.sessionStorage.removeItem(
      ENTRY_STORAGE_KEY
    );
  } catch {
    // Ignore browser storage failures.
  }
}


export function WellbeingAccessProvider({
  children,
}) {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    active: siteAccessActive,
    loading: siteAccessLoading,
    access: siteAccess,
    refreshAccess,
  } = useSiteAccess();


  const [
    entryGranted,
    setEntryGranted,
  ] = useState(
    readStoredEntryGrant
  );

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    pendingPath,
    setPendingPath,
  ] = useState(null);

  const [
    unlocking,
    setUnlocking,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    latestBalance,
    setLatestBalance,
  ] = useState(null);


  const previousPathRef =
    useRef(
      location.pathname
    );


  /* ===================================================
     END THE 1-TOKEN ENTRY GRANT WHEN USER LEAVES
     THE WELLBEING AREA.

     Internal navigation such as:
     /app/wellbeing
     /app/wellbeing/sleep-rest
     /app/wellbeing/psychometrics/...

     keeps the same entry grant.
     =================================================== */

  useEffect(() => {
    const previousPath =
      previousPathRef.current;

    const currentPath =
      location.pathname;

    if (
      isWellbeingPath(
        previousPath
      ) &&
      !isWellbeingPath(
        currentPath
      )
    ) {
      removeStoredEntryGrant();
      setEntryGranted(false);
    }

    previousPathRef.current =
      currentPath;
  }, [
    location.pathname,
  ]);


  const requestWellbeingAccess =
    useCallback(
      (
        destination =
          "/app/wellbeing"
      ) => {
        if (
          siteAccessActive ||
          entryGranted
        ) {
          navigate(
            destination
          );

          return;
        }

        setPendingPath(
          destination
        );

        setError("");
        setLatestBalance(null);
        setModalOpen(true);
      },
      [
        entryGranted,
        navigate,
        siteAccessActive,
      ]
    );


  const closeWellbeingModal =
    useCallback(
      () => {
        if (unlocking) {
          return;
        }

        setModalOpen(false);
        setPendingPath(null);
        setError("");
        setLatestBalance(null);
      },
      [unlocking]
    );


  const unlockCurrentWellbeingEntry =
    useCallback(
      async () => {
        if (unlocking) {
          return null;
        }

        try {
          setUnlocking(true);
          setError("");

          const result =
            await unlockWellbeingAccess();

          if (
            result?.granted !== true
          ) {
            throw new Error(
              "Wellbeing access was not granted."
            );
          }

          if (
            result?.walletBalance !==
            undefined
          ) {
            setLatestBalance(
              Number(
                result.walletBalance
              )
            );
          }

          storeEntryGrant();
          setEntryGranted(true);

          const destination =
            pendingPath ||
            "/app/wellbeing";

          setModalOpen(false);
          setPendingPath(null);

          /*
            Refresh header token balance and the global
            site-access status after the 1-token debit.
          */
          window.dispatchEvent(
            new Event(
              "anandam:tokens-updated"
            )
          );

          await refreshAccess()
            .catch(() => null);

          navigate(
            destination
          );

          return result;
        } catch (unlockError) {
          const data =
            unlockError?.data ||
            unlockError?.response
              ?.data ||
            {};

          const currentBalance =
            data?.currentBalance ??
            data?.walletBalance;

          if (
            currentBalance !==
            undefined &&
            Number.isFinite(
              Number(
                currentBalance
              )
            )
          ) {
            setLatestBalance(
              Number(
                currentBalance
              )
            );
          }

          setError(
            data?.message ||
            unlockError?.message ||
            "Unable to unlock Wellbeing."
          );

          throw unlockError;
        } finally {
          setUnlocking(false);
        }
      },
      [
        navigate,
        pendingPath,
        refreshAccess,
        unlocking,
      ]
    );


  const tokenBalance =
    latestBalance !== null
      ? latestBalance
      : Number(
          siteAccess?.tokenBalance ??
          0
        );


  const value =
    useMemo(
      () => ({
        entryGranted,
        siteAccessActive,
        siteAccessLoading,

        modalOpen,
        pendingPath,
        unlocking,
        error,

        tokenCost: 1,
        tokenBalance,

        requestWellbeingAccess,
        closeWellbeingModal,
        unlockCurrentWellbeingEntry,
      }),
      [
        entryGranted,
        siteAccessActive,
        siteAccessLoading,
        modalOpen,
        pendingPath,
        unlocking,
        error,
        tokenBalance,
        requestWellbeingAccess,
        closeWellbeingModal,
        unlockCurrentWellbeingEntry,
      ]
    );


  return (
    <WellbeingAccessContext.Provider
      value={value}
    >
      {children}
    </WellbeingAccessContext.Provider>
  );
}


export function useWellbeingAccess() {
  const context =
    useContext(
      WellbeingAccessContext
    );

  if (!context) {
    throw new Error(
      "useWellbeingAccess must be used inside WellbeingAccessProvider."
    );
  }

  return context;
}


export default WellbeingAccessContext;
