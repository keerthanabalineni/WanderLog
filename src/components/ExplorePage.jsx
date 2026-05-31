import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

function ExplorePage() {
  const { user, logout, bucket, counts } = useApp();
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    async function loadCountries() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca3,flags,region,capital,population,area,subregion,languages,borders",
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to load countries.");
        }

        const data = await response.json();
        setCountries(Array.isArray(data) ? data.sort((a, b) => a.name.common.localeCompare(b.name.common)) : []);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError(fetchError.message || "Country list failed to load.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadCountries();
    return () => controller.abort();
  }, []);

  const regions = useMemo(() => {
    return [
      "All",
      ...Array.from(new Set(countries.map((country) => country.region).filter(Boolean))).sort(),
    ];
  }, [countries]);

  const filteredCountries = useMemo(() => {
    return countries.filter((country) => {
      const text = `${country.name.common} ${country.capital?.[0] ?? ""}`.toLowerCase();
      const searchMatch = text.includes(search.toLowerCase());
      const regionMatch = regionFilter === "All" || country.region === regionFilter;
      return searchMatch && regionMatch;
    });
  }, [countries, search, regionFilter]);

  return (
    <main className="page-wrapper">
      <header className="topbar">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1>Explore the world</h1>
          <p className="subtext">Signed in as <strong>{user.email}</strong></p>
        </div>

        <div className="topbar-actions">
          <button className="secondary-btn logout-btn" onClick={() => { logout(); navigate("/login", { replace: true }); }}>
            Sign out
          </button>
        </div>
      </header>

      <div className="meta-row">
        <div className="metric-card">
          <span className="metric-label">Bucket list</span>
          <strong>{counts.wish}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">Visited</span>
          <strong>{counts.visited}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">Showing</span>
          <strong>{filteredCountries.length}</strong>
        </div>
      </div>

      <div className="toolbar">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by country or capital"
        />

        <div className="filters">
          {regions.map((region) => (
            <button
              key={region}
              type="button"
              className={regionFilter === region ? "active" : ""}
              onClick={() => setRegionFilter(region)}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="status-text">Loading countries…</p>
      ) : error ? (
        <p className="status-text error">{error}</p>
      ) : (
        <div className="country-grid">
          {filteredCountries.map((country) => {
            const status = bucket[country.cca3];
            return (
              <Link className="country-card" key={country.cca3} to={`/country/${country.cca3}`}>
                <img src={country.flags.svg || country.flags.png} alt={country.name.common} />

                <div className="card-body">
                  <div className="card-title-row">
                    <h3>{country.name.common}</h3>
                    {status && <span className={`status-pill ${status}`}>{status}</span>}
                  </div>

                  <p className="country-meta">
                    {country.capital?.[0] ?? "No capital"} · {country.region}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default ExplorePage;
