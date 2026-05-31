import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

function formatNumber(value) {
  return new Intl.NumberFormat().format(value)
}

function listValues(source) {
  if (!source) {
    return '—'
  }
  return Object.values(source).join(', ')
}

export default function CountryDetail({ bucket, onAdd, onUpdate, onRemove }) {
  const { code } = useParams()
  const navigate = useNavigate()
  const [country, setCountry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCountry = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(
          `https://restcountries.com/v3.1/alpha/${code}?fields=name,cca3,flags,region,subregion,capital,population,area,languages,currencies,borders`
        )
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to load country details.')
        }

        setCountry(Array.isArray(data) ? data[0] : data)
      } catch (fetchError) {
        setError(fetchError.message || 'Unable to load country details.')
      } finally {
        setLoading(false)
      }
    }

    fetchCountry()
  }, [code])

  const current = bucket[code]
  const status = current?.status
  const actionLabel = !status ? 'Add to wish list' : status === 'wish' ? 'Mark visited' : 'Move to wish list'

  const handleAction = () => {
    if (!country) {
      return
    }

    if (!status) {
      onAdd(code, {
        name: country.name.common,
        region: country.region
      })
      return
    }

    if (status === 'wish') {
      onUpdate(code, 'visited')
      return
    }

    onUpdate(code, 'wish')
  }

  return (
    <main className="page detail-page">
      <div className="detail-header">
        <div>
          <button className="button tertiary" type="button" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
        <div className="detail-actions">
          <Link to="/" className="button secondary">
            Explore countries
          </Link>
        </div>
      </div>

      {error ? (
        <div className="error-box detail-error">{error}</div>
      ) : loading ? (
        <div className="loader-panel">
          <div className="loader" />
          <p>Loading country details…</p>
        </div>
      ) : country ? (
        <section className="detail-grid">
          <div className="detail-map">
            <img
              src={country.flags.svg}
              alt={`Flag of ${country.name.common}`}
              className="detail-flag"
            />
          </div>

          <div className="detail-card">
            <div className="detail-title-row">
              <div>
                <p className="eyebrow">Country detail</p>
                <h1>{country.name.common}</h1>
                <p className="detail-subtitle">{country.region} • {country.subregion}</p>
              </div>
              {status && <span className={`status-pill ${status === 'visited' ? 'visited' : ''}`}>{status}</span>}
            </div>

            <div className="detail-meta">
              <div className="meta-item">
                <span>Capital</span>
                <strong>{country.capital?.[0] || '—'}</strong>
              </div>
              <div className="meta-item">
                <span>Population</span>
                <strong>{formatNumber(country.population)}</strong>
              </div>
              <div className="meta-item">
                <span>Area</span>
                <strong>{formatNumber(country.area)} km²</strong>
              </div>
              <div className="meta-item">
                <span>Languages</span>
                <strong>{listValues(country.languages)}</strong>
              </div>
              <div className="meta-item">
                <span>Currencies</span>
                <strong>{listValues(country.currencies)}</strong>
              </div>
            </div>

            <div className="detail-buttons">
              <button className="button primary" type="button" onClick={handleAction}>
                {actionLabel}
              </button>
              {status && (
                <button className="button tertiary" type="button" onClick={() => onRemove(code)}>
                  Remove from bucket list
                </button>
              )}
            </div>

            {Array.isArray(country.borders) && country.borders.length > 0 && (
              <div className="border-list-panel">
                <p className="field-label">Bordering countries</p>
                <div className="border-list">
                  {country.borders.map((borderCode) => (
                    <Link key={borderCode} to={`/country/${borderCode}`} className="border-pill">
                      {borderCode}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      ) : null}
    </main>
  )
}
