import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

function formatNumber(value) {
  return new Intl.NumberFormat().format(value)
}

export default function ExplorePage({ bucket, wishCount, visitedCount, onLogout }) {
  const [countries, setCountries] = useState([])
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('All')
  const [sortKey, setSortKey] = useState('name')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(
          'https://restcountries.com/v3.1/all?fields=name,cca3,flags,region,capital,population,area'
        )
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to load country data.')
        }

        const sorted = data.sort((a, b) => a.name.common.localeCompare(b.name.common))
        setCountries(sorted)
      } catch (fetchError) {
        setError(fetchError.message || 'Country list failed to load.')
      } finally {
        setLoading(false)
      }
    }

    fetchCountries()
  }, [])

  const regions = useMemo(() => {
    const unique = new Set(countries.map((country) => country.region).filter(Boolean))
    return ['All', ...Array.from(unique).sort()]
  }, [countries])

  const filteredCountries = useMemo(() => {
    return countries
      .filter((country) => {
        const searchText = `${country.name.common} ${country.capital?.[0] ?? ''}`.toLowerCase()
        return searchText.includes(search.toLowerCase())
      })
      .filter((country) => region === 'All' || country.region === region)
      .sort((a, b) => {
        if (sortKey === 'population') {
          return a.population - b.population
        }
        if (sortKey === 'area') {
          return a.area - b.area
        }
        return a.name.common.localeCompare(b.name.common)
      })
  }, [countries, search, region, sortKey])

  const totalCountries = countries.length
  const selectedCount = filteredCountries.length

  return (
    <main className="page explore-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Explore</p>
          <h1>Discover countries worth adding to your bucket list</h1>
          <p className="lead">
            Search, filter, and save destinations you want to visit. Your travel preferences persist across refreshes.
          </p>
        </div>
        <div className="top-actions">
          <div className="pill-row">
            <span className="pill">Wish list: {wishCount}</span>
            <span className="pill visited">Visited: {visitedCount}</span>
          </div>
          <button className="button secondary" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="search-panel">
        <div className="controls">
          <label className="field-group">
            <span>Search</span>
            <input
              className="form-control"
              placeholder="Search by country or capital"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <label className="field-group">
            <span>Region</span>
            <select className="form-control" value={region} onChange={(event) => setRegion(event.target.value)}>
              {regions.map((regionOption) => (
                <option key={regionOption} value={regionOption}>
                  {regionOption}
                </option>
              ))}
            </select>
          </label>

          <label className="field-group">
            <span>Sort by</span>
            <select className="form-control" value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
              <option value="name">Name</option>
              <option value="population">Population</option>
              <option value="area">Area</option>
            </select>
          </label>
        </div>
      </section>

      <section className="summary-panel">
        <div className="summary-item">
          <strong>{totalCountries}</strong>
          <span>countries loaded</span>
        </div>
        <div className="summary-item">
          <strong>{selectedCount}</strong>
          <span>results shown</span>
        </div>
        <div className="summary-item">
          <strong>{wishCount + visitedCount}</strong>
          <span>saved destinations</span>
        </div>
      </section>

      {error ? (
        <div className="error-box">
          <p>Unable to load countries.</p>
          <p>{error}</p>
          <button className="button tertiary" type="button" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="loader-panel">
          <div className="loader" />
          <p>Loading countries…</p>
        </div>
      ) : (
        <section className="grid-panel">
          {filteredCountries.map((country) => {
            const saved = bucket[country.cca3]
            return (
              <article key={country.cca3} className="country-card">
                <img src={country.flags.svg} alt={`Flag of ${country.name.common}`} className="country-flag" />
                <div className="country-card-body">
                  <div className="card-header">
                    <div>
                      <h2>{country.name.common}</h2>
                      <p>{country.region}</p>
                    </div>
                    {saved && <span className={`status-pill ${saved.status === 'visited' ? 'visited' : ''}`}>{saved.status}</span>}
                  </div>

                  <div className="country-meta">
                    <span>Population</span>
                    <strong>{formatNumber(country.population)}</strong>
                  </div>
                  <div className="country-meta">
                    <span>Area</span>
                    <strong>{formatNumber(country.area)} km²</strong>
                  </div>
                  <div className="country-meta">
                    <span>Capital</span>
                    <strong>{country.capital?.[0] || '—'}</strong>
                  </div>

                  <Link to={`/country/${country.cca3}`} className="button primary block-link">
                    View details
                  </Link>
                </div>
              </article>
            )
          })}
        </section>
      )}
    </main>
  )
}
