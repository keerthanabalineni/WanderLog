import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";

function CountryDetail() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { bucket, updateCountryStatus } = useApp();
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const status = bucket[code];

  useEffect(() => {
    if (!code) return;

    const controller = new AbortController();

    async function loadCountry() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `https://restcountries.com/v3.1/alpha/${code}?fields=name,cca3,flags,region,subregion,capital,population,area,languages,currencies,borders`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to load country details.");
        }

        const data = await response.json();
        setCountry(Array.isArray(data) ? data[0] : data);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError(fetchError.message || "Country details failed to load.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadCountry();
    return () => controller.abort();
  }, [code]);

  const handlePrimary = () => {
    if (!code) return;
    updateCountryStatus(code, status === "visited" ? "wish" : "visited");
  };

  const handleSecondary = () => {
    if (!code) return;
    updateCountryStatus(code, status ? null : "wish");
  };

  const languageText = country?.languages ? Object.values(country.languages).join(", ") : "—";
  const currencyText = country?.currencies
    ? Object.values(country.currencies).map((item) => item.name).join(", ")
    : "—";

  return (
    <main className="page-wrapper">
      <div className="detail-card">
        <div className="detail-header">
          <button className="back-button" type="button" onClick={() => navigate("/explore", { replace: true })}>
            ← Back to explore
          </button>
          <span className={`status-pill ${status || ""}`}>{status ? status : "Not saved"}</span>
        </div>

        {loading ? (
          <p className="status-text">Loading country details…</p>
        ) : error ? (
          <p className="status-text error">{error}</p>
        ) : country ? (
          <>
            <img
              className="detail-flag"
              src={country.flags.svg || country.flags.png}
              alt={country.name.common}
            />

            <div className="detail-title">
              <h1>{country.name.common}</h1>
              <p>📍 {country.capital?.[0] ?? "—"}</p>
            </div>

            <div className="stats-grid">
              <div className="stat-block">
                <span>Region</span>
                <strong>{country.region ?? "—"}</strong>
              </div>
              <div className="stat-block">
                <span>Subregion</span>
                <strong>{country.subregion ?? "—"}</strong>
              </div>
              <div className="stat-block">
                <span>Population</span>
                <strong>{country.population?.toLocaleString() ?? "—"}</strong>
              </div>
              <div className="stat-block">
                <span>Area</span>
                <strong>{country.area?.toLocaleString() ?? "—"} km²</strong>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-block">
                <span>Language</span>
                <strong>{languageText}</strong>
              </div>
              <div className="stat-block">
                <span>Currency</span>
                <strong>{currencyText}</strong>
              </div>
              <div className="stat-block">
                <span>Capital</span>
                <strong>{country.capital?.[0] ?? "—"}</strong>
              </div>
            </div>

            <section className="neighbors">
              <h2>Neighboring countries</h2>
              <div className="neighbors-list">
                {country.borders?.length ? (
                  country.borders.map((border) => (
                    <Link key={border} className="neighbor-pill" to={`/country/${border}`}>
                      {border}
                    </Link>
                  ))
                ) : (
                  <span>No neighbors available</span>
                )}
              </div>
            </section>

            <div className="detail-actions">
              <button className="primary-btn" type="button" onClick={handlePrimary}>
                {status === "visited" ? "Move to bucket list" : "Mark visited"}
              </button>
              <button className="secondary-btn" type="button" onClick={handleSecondary}>
                {status ? "Remove from list" : "Add to bucket list"}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}

export default CountryDetail;
