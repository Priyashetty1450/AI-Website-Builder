const formatter = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export default function WebsitePreviewCard({
  website,
  title = 'Live Website Preview',
  subtitle,
  showMeta = false,
}) {
  return (
    <article className="preview-card">
      <div className="preview-card-header">
        <div>
          <p className="eyebrow">{subtitle || 'Homepage Copy Preview'}</p>
          <h2>{title}</h2>
        </div>
        {showMeta ? (
          <div className="meta-stack">
            <span>{website.businessType}</span>
            <span>Updated {formatter.format(new Date(website.updatedAt || website.createdAt))}</span>
          </div>
        ) : null}
      </div>

      <section className="preview-section">
        <span className="preview-label">Website Title</span>
        <h3>{website.title}</h3>
      </section>

      <section className="preview-section">
        <span className="preview-label">Tagline</span>
        <p className="tagline">{website.tagline}</p>
      </section>

      <section className="preview-section">
        <span className="preview-label">About Section</span>
        <p>{website.about}</p>
      </section>

      <section className="preview-section">
        <span className="preview-label">Services List</span>
        <div className="service-list">
          {website.services.map((service) => (
            <span key={service} className="service-pill">
              {service}
            </span>
          ))}
        </div>
      </section>
    </article>
  );
}
