import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getPractitioners,
  getMarketplaceSpecialties,
} from "../api/marketplaceApi";

import "../styles/marketplace.css";


// ======================================================
// HELPERS
// ======================================================

const formatCurrency = (
  value,
  currency = "INR"
) => {
  try {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }
    ).format(Number(value));
  } catch {
    return `${currency} ${value}`;
  }
};


export default function MarketplacePage() {
  const navigate =
    useNavigate();


  // ======================================================
  // STATE
  // ======================================================

  const [
    practitioners,
    setPractitioners,
  ] = useState([]);

  const [
    specialties,
    setSpecialties,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });


  const [
    filters,
    setFilters,
  ] = useState({
    search: "",
    type: "",
    specialty: "",
    language: "",
    minPrice: "",
    maxPrice: "",
    page: 1,
  });


  // ======================================================
  // LOAD SPECIALTIES
  // ======================================================

  useEffect(() => {
    const loadSpecialties =
      async () => {
        try {
          const data =
            await getMarketplaceSpecialties();

          setSpecialties(
            data.specialties || []
          );
        } catch (err) {
          console.error(
            "loadSpecialties:",
            err
          );
        }
      };

    loadSpecialties();
  }, []);


  // ======================================================
  // LOAD PRACTITIONERS
  // ======================================================

  useEffect(() => {
    const loadPractitioners =
      async () => {
        try {
          setLoading(true);
          setError("");

          const params = {};

          if (
            filters.search.trim()
          ) {
            params.search =
              filters.search.trim();
          }

          if (
            filters.type
          ) {
            params.type =
              filters.type;
          }

          if (
            filters.specialty
          ) {
            params.specialty =
              filters.specialty;
          }

          if (
            filters.language
          ) {
            params.language =
              filters.language;
          }

          if (
            filters.minPrice
          ) {
            params.minPrice =
              filters.minPrice;
          }

          if (
            filters.maxPrice
          ) {
            params.maxPrice =
              filters.maxPrice;
          }

          params.page =
            filters.page;

          params.limit = 12;

          const data =
            await getPractitioners(
              params
            );

          setPractitioners(
            data.practitioners || []
          );

          setPagination(
            data.pagination || {
              page: 1,
              limit: 12,
              total: 0,
              totalPages: 0,
            }
          );
        } catch (err) {
          console.error(
            "loadPractitioners:",
            err
          );

          setError(
            err?.response?.data?.message ||
              "Unable to load practitioners."
          );
        } finally {
          setLoading(false);
        }
      };


    const timer =
      setTimeout(
        loadPractitioners,
        250
      );

    return () =>
      clearTimeout(timer);
  }, [filters]);


  // ======================================================
  // DERIVED VALUES
  // ======================================================

  const languages =
    useMemo(() => {
      const unique =
        new Set();

      practitioners.forEach(
        (practitioner) => {
          (
            practitioner.languages ||
            []
          ).forEach(
            (language) =>
              unique.add(
                language
              )
          );
        }
      );

      return [
        ...unique,
      ].sort();
    }, [practitioners]);


  // ======================================================
  // FILTER HELPERS
  // ======================================================

  const updateFilter = (
    key,
    value
  ) => {
    setFilters(
      (current) => ({
        ...current,
        [key]: value,
        page: 1,
      })
    );
  };


  const clearFilters = () => {
    setFilters({
      search: "",
      type: "",
      specialty: "",
      language: "",
      minPrice: "",
      maxPrice: "",
      page: 1,
    });
  };


  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="marketplace-page">

      <div className="marketplace-content">

        {/* ===============================================
            PAGE HEADER
        =============================================== */}

        <div className="marketplace-page-header">

          <div>
            <h1>
              Marketplace
            </h1>

            <p>
              Explore wellbeing stays
              and find practitioners
              who support your
              wellbeing.
            </p>
          </div>

          <button
            className="marketplace-secondary-button"
            onClick={() =>
              navigate(
                "/marketplace/enquiries"
              )
            }
          >
            My enquiries
          </button>

        </div>


        {/* ===============================================
            TOP CATEGORY FILTERS
        =============================================== */}

        <div className="marketplace-filter-bar">

          <div className="marketplace-category-row">

            <button
              className={
                !filters.type
                  ? "marketplace-filter-chip active"
                  : "marketplace-filter-chip"
              }
              onClick={() =>
                updateFilter(
                  "type",
                  ""
                )
              }
            >
              All
            </button>

            <button
              className={
                filters.type ===
                "PSYCHOLOGIST"
                  ? "marketplace-filter-chip active"
                  : "marketplace-filter-chip"
              }
              onClick={() =>
                updateFilter(
                  "type",
                  "PSYCHOLOGIST"
                )
              }
            >
              Mental Health
            </button>

            <button
              className={
                filters.type ===
                "COUNSELLOR"
                  ? "marketplace-filter-chip active"
                  : "marketplace-filter-chip"
              }
              onClick={() =>
                updateFilter(
                  "type",
                  "COUNSELLOR"
                )
              }
            >
              Counselling
            </button>

            <button
              className={
                filters.type ===
                "COACH"
                  ? "marketplace-filter-chip active"
                  : "marketplace-filter-chip"
              }
              onClick={() =>
                updateFilter(
                  "type",
                  "COACH"
                )
              }
            >
              Coaching
            </button>

            <button
              className={
                filters.type ===
                "WELLNESS_PRACTITIONER"
                  ? "marketplace-filter-chip active"
                  : "marketplace-filter-chip"
              }
              onClick={() =>
                updateFilter(
                  "type",
                  "WELLNESS_PRACTITIONER"
                )
              }
            >
              Physical Wellness
            </button>

          </div>


          <div className="marketplace-filter-selects">

            <input
              type="text"
              className="marketplace-search-input"
              placeholder="Search practitioners"
              value={
                filters.search
              }
              onChange={(e) =>
                updateFilter(
                  "search",
                  e.target.value
                )
              }
            />


            <select
              value={
                filters.specialty
              }
              onChange={(e) =>
                updateFilter(
                  "specialty",
                  e.target.value
                )
              }
            >
              <option value="">
                Specialty
              </option>

              {specialties.map(
                (specialty) => (
                  <option
                    key={
                      specialty.id
                    }
                    value={
                      specialty.slug
                    }
                  >
                    {
                      specialty.name
                    }
                  </option>
                )
              )}
            </select>


            <select
              value={
                filters.language
              }
              onChange={(e) =>
                updateFilter(
                  "language",
                  e.target.value
                )
              }
            >
              <option value="">
                Language
              </option>

              {languages.map(
                (language) => (
                  <option
                    key={
                      language
                    }
                    value={
                      language
                    }
                  >
                    {language}
                  </option>
                )
              )}
            </select>

          </div>

        </div>


        {/* ===============================================
            RESULTS HEADER
        =============================================== */}

        <div className="marketplace-results-meta">

          <span>
            {pagination.total}{" "}
            practitioner
            {pagination.total === 1
              ? ""
              : "s"}
          </span>

          {(
            filters.search ||
            filters.type ||
            filters.specialty ||
            filters.language ||
            filters.minPrice ||
            filters.maxPrice
          ) && (
            <button
              className="marketplace-clear-filters"
              onClick={
                clearFilters
              }
            >
              Clear filters
            </button>
          )}

        </div>


        {/* ===============================================
            LOADING
        =============================================== */}

        {loading && (
          <div className="marketplace-grid">

            {Array.from(
              {
                length: 4,
              }
            ).map(
              (_, index) => (
                <div
                  className="practitioner-card marketplace-skeleton-card"
                  key={
                    index
                  }
                >
                  <div className="marketplace-skeleton-line large" />
                  <div className="marketplace-skeleton-line" />
                  <div className="marketplace-skeleton-line" />
                </div>
              )
            )}

          </div>
        )}


        {/* ===============================================
            ERROR
        =============================================== */}

        {!loading &&
          error && (
            <div className="marketplace-error">
              {error}
            </div>
          )}


        {/* ===============================================
            EMPTY STATE
        =============================================== */}

        {!loading &&
          !error &&
          practitioners.length ===
            0 && (
            <div className="marketplace-empty-state">

              <h3>
                No practitioners found
              </h3>

              <p>
                Try changing your
                filters or search.
              </p>

              <button
                className="marketplace-primary-button"
                onClick={
                  clearFilters
                }
              >
                Clear filters
              </button>

            </div>
          )}


        {/* ===============================================
            PRACTITIONER CARDS
        =============================================== */}

        {!loading &&
          !error &&
          practitioners.length >
            0 && (

            <div className="marketplace-grid">

              {practitioners.map(
                (
                  practitioner
                ) => (

                  <article
                    className="practitioner-card"
                    key={
                      practitioner.id
                    }
                  >

                    {/* TOP */}

                    <div className="practitioner-card-header">

                      <div className="practitioner-card-avatar">

                        {practitioner
                          .profileImageUrl ? (

                          <img
                            src={
                              practitioner.profileImageUrl
                            }
                            alt={
                              practitioner
                                .user
                                ?.fullName ||
                              "Practitioner"
                            }
                          />

                        ) : (

                          <span>
                            {
                              practitioner
                                .user
                                ?.fullName?.[0] ||
                              "P"
                            }
                          </span>

                        )}

                      </div>


                      <div className="practitioner-card-name">

                        <h2>
                          {
                            practitioner
                              .user
                              ?.fullName
                          }
                        </h2>

                        <p>
                          {
                            practitioner
                              .professionalTitle ||
                            practitioner
                              .practitionerType
                          }
                        </p>

                      </div>

                    </div>


                    {/* META */}

                    <div className="practitioner-card-meta">

                      {practitioner
                        .languages
                        ?.length >
                        0 && (

                        <div className="practitioner-meta-item">

                          <span className="practitioner-meta-label">
                            Speaks
                          </span>

                          <strong>
                            {practitioner.languages.join(
                              ", "
                            )}
                          </strong>

                        </div>

                      )}


                      {practitioner
                        .experienceYears && (

                        <div className="practitioner-meta-item">

                          <span className="practitioner-meta-label">
                            Experience
                          </span>

                          <strong>
                            {
                              practitioner.experienceYears
                            }{" "}
                            years
                          </strong>

                        </div>

                      )}

                    </div>


                    {/* SPECIALTIES */}

                    {practitioner
                      .specialties
                      ?.length >
                      0 && (

                      <div className="practitioner-specialties">

                        <span className="practitioner-meta-label">
                          Expertise
                        </span>

                        <div className="practitioner-specialty-list">

                          {practitioner.specialties
                            .slice(
                              0,
                              4
                            )
                            .map(
                              (
                                item
                              ) => (

                                <span
                                  className="practitioner-specialty-chip"
                                  key={
                                    item
                                      .specialty
                                      .id
                                  }
                                >
                                  {
                                    item
                                      .specialty
                                      .name
                                  }
                                </span>

                              )
                            )}

                        </div>

                      </div>
                    )}


                    {/* FOOTER */}

                    <div className="practitioner-card-footer">

                      <div className="practitioner-price">

                        <strong>
                          {formatCurrency(
                            practitioner.sessionPrice,
                            practitioner.currency
                          )}
                        </strong>

                        <span>
                          / session
                        </span>

                      </div>


                      <button
                        className="marketplace-primary-button"
                        onClick={() =>
                          navigate(
                            `/marketplace/practitioners/${practitioner.slug}`
                          )
                        }
                      >
                        View profile
                      </button>

                    </div>

                  </article>

                )
              )}

            </div>

          )}


        {/* ===============================================
            PAGINATION
        =============================================== */}

        {!loading &&
          pagination.totalPages >
            1 && (

            <div className="marketplace-pagination">

              <button
                className="marketplace-secondary-button"
                disabled={
                  pagination.page <=
                  1
                }
                onClick={() =>
                  setFilters(
                    (
                      current
                    ) => ({
                      ...current,

                      page:
                        current.page -
                        1,
                    })
                  )
                }
              >
                Previous
              </button>


              <span>
                Page{" "}
                {
                  pagination.page
                }{" "}
                of{" "}
                {
                  pagination.totalPages
                }
              </span>


              <button
                className="marketplace-secondary-button"
                disabled={
                  pagination.page >=
                  pagination.totalPages
                }
                onClick={() =>
                  setFilters(
                    (
                      current
                    ) => ({
                      ...current,

                      page:
                        current.page +
                        1,
                    })
                  )
                }
              >
                Next
              </button>

            </div>

          )}

      </div>
    </div>
  );
}