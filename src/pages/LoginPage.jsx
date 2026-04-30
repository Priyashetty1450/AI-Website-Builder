import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import FormField from '../components/FormField.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { validateLoginForm } from '../utils/validation.js';

const initialState = {
  email: '',
  password: '',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const notice = location.state?.message;

    if (notice) {
      setSubmitError(notice);
    }
  }, [location.state]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[name];
      return nextErrors;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateLoginForm(formData);
    setErrors(validationErrors);
    setSubmitError('');

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await login(formData);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setSubmitError(error.message || 'Invalid credentials.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="section-heading">
          <div>
            <h2>Log in</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-grid auth-form-grid">
          <FormField
            id="loginEmail"
            name="email"
            type="email"
            label="Email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />

          <FormField
            id="loginPassword"
            name="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />

          {submitError ? <p className="banner banner-error">{submitError}</p> : null}

          <button type="submit" className="button field-span-full" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/">Back to home</Link>
        </p>

        <p className="auth-footer">
          Need an account? <Link to="/signup">Create one</Link>.
        </p>
      </section>
    </div>
  );
}
