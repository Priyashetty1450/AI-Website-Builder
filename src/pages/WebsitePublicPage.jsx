import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageState from '../components/PageState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export default function WebsitePublicPage() {
  const { websiteId } = useParams();
  const { token } = useAuth();
  const [website, setWebsite] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
          setError(requestError.message || 'Unable to open this website.');
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

  if (isLoading) {
    return <PageState title="Opening website" message="Preparing the clean website view." />;
  }

  if (error || !website) {
    return (
      <PageState
        title="Website unavailable"
        message={error || 'This website could not be opened.'}
      />
    );
  }

  return (
    <main className="published-shell">
      <article className="published-site">
        <section className="published-hero">
          <p className="published-kicker">{website.businessType}</p>
          <h1>{website.title || website.businessName}</h1>
          <p>{website.tagline}</p>
        </section>

        <section className="published-section">
          <p className="published-section-label">About</p>
          <h2>{website.businessName}</h2>
          <p>{website.about}</p>
        </section>

        <section className="published-section">
          <p className="published-section-label">Services</p>
          <h2>What we offer</h2>
          <div className="published-services">
            {website.services.map((service) => (
              <span key={service}>{service}</span>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
