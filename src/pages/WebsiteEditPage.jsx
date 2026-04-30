import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FormField from '../components/FormField.jsx';
import PageState from '../components/PageState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { buildServicesArray, validateWebsiteForm } from '../utils/validation.js';

function serializeWebsite(website) {
  return {
    businessName: website.businessName || '',
    businessType: website.businessType || '',
    description: website.description || '',
    title: website.title || '',
    tagline: website.tagline || '',
    about: website.about || '',
    servicesText: Array.isArray(website.services) ? website.services.join('\n') : '',
  };
}

export default function WebsiteEditPage() {
  const navigate = useNavigate();
  const { websiteId } = useParams();
  const { token } = useAuth();
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchWebsite() {
      try {
        setIsLoading(true);
        const website = await api.getWebsite(websiteId, token);

        if (isMounted) {
          setFormData(serializeWebsite(website));
          setErrorMessage('');
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || 'Unable to load this website for editing.');
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
    const validationErrors = validateWebsiteForm(formData);
    setErrors(validationErrors);
    setErrorMessage('');

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await api.updateWebsite(
        websiteId,
        {
          businessName: formData.businessName,
          businessType: formData.businessType,
          description: formData.description,
          title: formData.title,
          tagline: formData.tagline,
          about: formData.about,
          services: buildServicesArray(formData.servicesText),
        },
        token,
      );

      navigate(`/websites/${websiteId}`, { replace: true });
    } catch (error) {
      setErrorMessage(error.message || 'Unable to save website changes.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <PageState title="Preparing the editor" message="We're loading your saved draft into the form now." />;
  }

  if (!formData) {
    return (
      <PageState
        title="Draft unavailable"
        message={errorMessage || 'This draft could not be loaded.'}
        action={
          <Link to="/websites" className="button">
            Back to Library
          </Link>
        }
      />
    );
  }

  return (
    <section className="card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Edit Draft</p>
          <h2>Refine the wording before you save again</h2>
          <p className="section-copy">
            Update the business story, sharpen the headline, or expand the services
            list until the message feels ready.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-grid">
        <FormField
          id="editBusinessName"
          name="businessName"
          label="Business Name"
          value={formData.businessName}
          onChange={handleChange}
          error={errors.businessName}
          maxLength={80}
        />

        <FormField
          id="editBusinessType"
          name="businessType"
          label="Business Type"
          value={formData.businessType}
          onChange={handleChange}
          error={errors.businessType}
          maxLength={60}
        />

        <FormField
          id="editDescription"
          name="description"
          label="Description"
          textarea
          rows={4}
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
          maxLength={400}
          className="field-span-full"
        />

        <FormField
          id="editTitle"
          name="title"
          label="Website Title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          maxLength={100}
        />

        <FormField
          id="editTagline"
          name="tagline"
          label="Tagline"
          value={formData.tagline}
          onChange={handleChange}
          error={errors.tagline}
          maxLength={120}
        />

        <FormField
          id="editAbout"
          name="about"
          label="About Section"
          textarea
          rows={6}
          value={formData.about}
          onChange={handleChange}
          error={errors.about}
          maxLength={700}
          className="field-span-full"
        />

        <FormField
          id="editServices"
          name="servicesText"
          label="Services List"
          textarea
          rows={6}
          value={formData.servicesText}
          onChange={handleChange}
          error={errors.servicesText}
          hint="Enter one service per line"
          className="field-span-full"
        />

        {errorMessage ? <p className="banner banner-error">{errorMessage}</p> : null}

        <div className="button-row field-span-full">
          <button type="submit" className="button" disabled={isSubmitting}>
            {isSubmitting ? 'Saving changes...' : 'Save Changes'}
          </button>
          <Link to={`/websites/${websiteId}`} className="button button-secondary">
            Back to Draft
          </Link>
        </div>
      </form>
    </section>
  );
}
