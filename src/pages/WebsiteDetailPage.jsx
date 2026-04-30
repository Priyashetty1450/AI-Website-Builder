import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageState from '../components/PageState.jsx';
import WebsitePreviewCard from '../components/WebsitePreviewCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export default function WebsiteDetailPage() {
  const navigate = useNavigate();
  const { websiteId } = useParams();
  const { token } = useAuth();
  const [website, setWebsite] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchWebsite() {
      try {
        setIsLoading(true);
        const response = await api.getWebsite(websiteId, token);

        if (isMounted) {
          setWebsite(response);
          setError('');
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message || 'Unable to load this website.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchWebsite();

    return () => {
      isMounted = false;
    };
  }, [token, websiteId]);

  async function handleDelete() {
    if (!window.confirm('Delete this saved draft permanently?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await api.deleteWebsite(websiteId, token);
      navigate('/websites', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete this draft.');
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return <PageState title="Opening your draft" message="We're loading the saved website so you can review it." />;
  }

  if (error) {
    return (
      <PageState
        title="This draft could not be opened"
        message={error}
        action={
          <Link to="/websites" className="button">
            Back to Library
          </Link>
        }
      />
    );
  }

  return (
    <div className="detail-layout">
      <WebsitePreviewCard
        website={website}
        title={website.businessName}
        subtitle={website.businessType}
        showMeta
      />

      <aside className="card sidebar-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Next Step</p>
            <h3>Keep refining the draft</h3>
            <p className="section-copy">
              Review the copy, make edits, or remove the draft if it is no longer the
              direction you want.
            </p>
          </div>
        </div>

        <div className="stack-actions">
          <Link to={`/websites/${websiteId}/edit`} className="button">
            Edit This Draft
          </Link>
          <Link to="/websites" className="button button-secondary">
            Back to Library
          </Link>
          <button type="button" className="button button-danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting draft...' : 'Delete Draft'}
          </button>
        </div>
      </aside>
    </div>
  );
}
