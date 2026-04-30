export default function PageState({ title, message, action, compact = false }) {
  return (
    <section className={`state-card${compact ? ' state-card-compact' : ''}`}>
      <h2>{title}</h2>
      <p>{message}</p>
      {action}
    </section>
  );
}
