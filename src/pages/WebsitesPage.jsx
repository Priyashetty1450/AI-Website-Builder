import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageState from '../components/PageState.jsx';
import Pagination from '../components/Pagination.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

const pageSize = 4;

const formatter = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
});

export default function WebsitesPage() {
  const { token } = useAuth();
  const [websites, setWebsites] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    pageSize,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchWebsites() {
      try {
        setIsLoading(true);
        const response = await api.listWebsites({ page, pageSize }, token);

        if (isMounted) {
          setWebsites(response.data);
          setMeta(response.meta);
          setError('');
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message || 'Unable to load saved websites.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchWebsites();

    return () => {
      isMounted = false;
    };
  }, [page, token]);

  async function handleDelete(websiteId) {
    if (!window.confirm('Delete this saved draft permanently?')) {
      return;
    }

    try {
      await api.deleteWebsite(websiteId, token);
      setSuccessMessage('Draft deleted successfully.');

      const shouldGoBackPage = websites.length === 1 && page > 1;
      if (shouldGoBackPage) {
        setPage((current) => current - 1);
        return;
      }

      const response = await api.listWebsites({ page, pageSize }, token);
      setWebsites(response.data);
      setMeta(response.meta);
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete the draft.');
    }
  }

  return (
    <section className="card">
      <div className="section-heading">
        <div>
          <h2>Saved drafts</h2>
        </div>
        <Link to="/dashboard" className="button">
          New Draft
        </Link>
      </div>

      {successMessage ? <p className="banner banner-success">{successMessage}</p> : null}
      {error ? <p className="banner banner-error">{error}</p> : null}

      {isLoading ? (
        <PageState compact title="Loading your drafts" message="We're pulling in your saved website drafts now." />
      ) : websites.length === 0 ? (
        <PageState
          compact
          title="Nothing saved yet"
          message="Create a draft from the builder and it will appear here as soon as you save it."
        />
      ) : (
        <>
          <div className="website-list">
            {websites.map((website) => (
              <article key={website.id} className="website-list-item">
                <div className="website-list-copy">
                  <p className="eyebrow">{website.businessType}</p>
                  <h3>{website.businessName}</h3>
                  <p className="tagline">{website.tagline}</p>
                  <p>{website.about}</p>
                </div>

                <div className="website-list-footer">
                  <span>Updated {formatter.format(new Date(website.updatedAt || website.createdAt))}</span>
                  <div className="inline-actions">
                    <Link to={`/websites/${website.id}`} className="button button-secondary">
                      Open Draft
                    </Link>
                    <Link
                      to={`/websites/${website.id}/view`}
                      target="_blank"
                      rel="noreferrer"
                      className="button button-secondary"
                    >
                      Open Website
                    </Link>
                    <Link to={`/websites/${website.id}/edit`} className="button button-secondary">
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="button button-danger"
                      onClick={() => handleDelete(website.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  );
}
