import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormField from '../components/FormField.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { validateSignupForm } from '../utils/validation.js';

const initialState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

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
    const validationErrors = validateSignupForm(formData);
    setErrors(validationErrors);
    setSubmitError('');

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await signup(formData);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setSubmitError(error.message || 'Unable to create your account.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="section-heading">
          <div>
            <h2>Create account</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-grid auth-form-grid">
          <FormField
            id="signupName"
            name="name"
            label="Full Name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
          />

          <FormField
            id="signupEmail"
            name="email"
            type="email"
            label="Email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />

          <FormField
            id="signupPassword"
            name="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />

          <FormField
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          {submitError ? <p className="banner banner-error">{submitError}</p> : null}

          <button type="submit" className="button field-span-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/">Back to home</Link>
        </p>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>.
        </p>
      </section>
    </div>
  );
}
