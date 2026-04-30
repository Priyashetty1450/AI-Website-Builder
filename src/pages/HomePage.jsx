import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  const featureCards = [
    {
      title: 'Write faster',
      description: 'Turn a few business details into homepage-ready copy in seconds.',
    },
    {
      title: 'Preview clearly',
      description: 'See the generated draft in a structured preview before saving it.',
    },
    {
      title: 'Save and refine',
      description: 'Keep drafts organized, edit them later, and update them anytime.',
    },
  ];

  return (
    <div className="home-shell">
      <header className="home-header">
        <div className="home-hero-grid">
          <div className="home-intro">
            <p className="eyebrow">AI Website Builder</p>
            <h1>Create polished website content without the long setup.</h1>
            <p className="home-copy">
              Start with a business name, a short description, and a service list. The app builds a clean draft,
              shows you a preview, and lets you save or edit it whenever you want.
            </p>

            <div className="home-actions">
              {isAuthenticated ? (
                <Link to="/dashboard" className="button">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="button">
                    Login
                  </Link>
                  <Link to="/signup" className="button button-secondary">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="home-preview" aria-hidden="true">
          <div className="home-preview-bar">
            <span />
            <span />
            <span />
          </div>
          <div className="home-preview-body">
            <div className="home-preview-main">
              <span className="home-preview-line home-preview-line-short" />
              <span className="home-preview-line home-preview-line-title" />
              <span className="home-preview-line" />
              <span className="home-preview-line home-preview-line-medium" />
            </div>
            <div className="home-preview-side">
              <span className="home-preview-chip" />
              <span className="home-preview-chip" />
              <span className="home-preview-chip home-preview-chip-short" />
            </div>
          </div>
        </div>

        <section className="home-features" aria-label="Homepage features">
          {featureCards.map((feature) => (
            <article key={feature.title} className="home-feature-card">
              <p className="eyebrow">Feature</p>
              <h2>{feature.title}</h2>
              <p>{feature.description}</p>
            </article>
          ))}
        </section>
      </header>
    </div>
  );
}
