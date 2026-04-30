export default function FormField({
  id,
  label,
  error,
  textarea = false,
  hint,
  className = '',
  ...props
}) {
  const Component = textarea ? 'textarea' : 'input';

  return (
    <label className={`field ${className}`} htmlFor={id}>
      <span className="field-label">{label}</span>
      <Component
        id={id}
        className={`field-input${textarea ? ' field-textarea' : ''}${error ? ' field-input-error' : ''}`}
        {...props}
      />
      {hint ? <span className="field-hint">{hint}</span> : null}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}
