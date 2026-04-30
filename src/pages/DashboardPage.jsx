import { useState } from 'react';
import { Link } from 'react-router-dom';
import FormField from '../components/FormField.jsx';
import PageState from '../components/PageState.jsx';
import WebsitePreviewCard from '../components/WebsitePreviewCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import {
  buildServicesArray,
  validateGenerationForm,
  validateWebsiteForm,
} from '../utils/validation.js';

const initialFormData = {
  businessName: '',
  businessType: '',
  description: '',
  title: '',
  tagline: '',
  about: '',
  servicesText: '',
};

const GENERATION_MIN_DURATION_MS = 800;

function pause(duration) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

function buildWebsitePayload(formData) {
  return {
    businessName: formData.businessName.trim(),
    businessType: formData.businessType.trim(),
    description: formData.description.trim(),
    title: formData.title.trim(),
    tagline: formData.tagline.trim(),
    about: formData.about.trim(),
    services: buildServicesArray(formData.servicesText),
  };
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [savedWebsiteId, setSavedWebsiteId] = useState(null);

  const previewWebsite = buildWebsitePayload(formData);
  const hasPreviewContent =
    Boolean(previewWebsite.title) &&
    Boolean(previewWebsite.tagline) &&
    Boolean(previewWebsite.about) &&
    previewWebsite.services.length > 0;

  const workflowSteps = ['Generate copy', 'Review preview', 'Save'];

  async function persistDraft(payload, currentDraftId = savedWebsiteId) {
    if (currentDraftId) {
      return api.updateWebsite(currentDraftId, payload, token);
    }

    return api.saveWebsite(payload, token);
  }

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

    setSaveMessage('');
  }

  async function handleGenerate() {
    const validationErrors = validateGenerationForm(formData);
    const startedAt = Date.now();

    setErrors(validationErrors);
    setErrorMessage('');
    setSaveMessage('');

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setIsGenerating(true);
      const response = await api.generateWebsite(formData, token);
      const nextFormData = {
        businessName: formData.businessName.trim() ? formData.businessName : response.businessName ?? '',
        businessType: formData.businessType.trim() ? formData.businessType : response.businessType ?? '',
        description: formData.description.trim() ? formData.description : response.description ?? '',
        title: formData.title.trim() ? formData.title : response.title ?? '',
        tagline: formData.tagline.trim() ? formData.tagline : response.tagline ?? '',
        about: formData.about.trim() ? formData.about : response.about ?? '',
        servicesText: formData.servicesText.trim()
          ? formData.servicesText
          : Array.isArray(response.services)
            ? response.services.join('\n')
            : '',
      };
      const elapsed = Date.now() - startedAt;

      if (elapsed < GENERATION_MIN_DURATION_MS) {
        await pause(GENERATION_MIN_DURATION_MS - elapsed);
      }

      setFormData((current) => ({
        ...current,
        ...nextFormData,
      }));
      setErrors((current) => {
        const nextErrors = { ...current };
        delete nextErrors.title;
        delete nextErrors.tagline;
        delete nextErrors.about;
        delete nextErrors.servicesText;
        return nextErrors;
      });
    } catch (error) {
      setErrorMessage(error.message || 'Unable to generate website content right now.');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    const validationErrors = validateGenerationForm(formData);
    setErrors(validationErrors);
    setSaveMessage('');

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage('');
      const payload = {
        businessName: formData.businessName.trim(),
        businessType: formData.businessType.trim(),
        description: formData.description.trim(),
        title: formData.title.trim(),
        tagline: formData.tagline.trim(),
        about: formData.about.trim(),
        services: buildServicesArray(formData.servicesText),
      };
      const savedWebsite = await persistDraft(payload);
      setFormData((current) => ({
        ...current,
        businessName: savedWebsite.businessName ?? current.businessName,
        businessType: savedWebsite.businessType ?? current.businessType,
        description: savedWebsite.description ?? current.description,
        title: savedWebsite.title ?? current.title,
        tagline: savedWebsite.tagline ?? current.tagline,
        about: savedWebsite.about ?? current.about,
        servicesText: Array.isArray(savedWebsite.services)
          ? savedWebsite.services.join('\n')
          : current.servicesText,
      }));
      const hadSavedWebsite = Boolean(savedWebsiteId);
      setSavedWebsiteId(savedWebsite.id);
      setSaveMessage(hadSavedWebsite ? 'Updated successfully.' : 'Saved successfully.');
    } catch (error) {
      setErrorMessage(error.message || 'Unable to save this website right now.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="dashboard-page">
      <section className="dashboard-intro card">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Create a polished website draft</h2>
          <p className="dashboard-intro-copy">
            Fill in the business details, generate copy, then refine the draft before saving it to your
            library.
          </p>
        </div>

        <div className="dashboard-workflow" aria-label="Draft workflow">
          {workflowSteps.map((step, index) => (
            <span key={step} className="workflow-pill">
              <strong>{index + 1}</strong>
              {step}
            </span>
          ))}
        </div>
      </section>

      <div className="dashboard-workspace">
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h3>Details</h3>
            </div>
          </div>

          <form onSubmit={handleSave} className="form-grid dashboard-form-grid">
            <FormField
              id="businessName"
              name="businessName"
              label="Business Name"
              value={formData.businessName}
              onChange={handleChange}
              error={errors.businessName}
              maxLength={80}
            />

            <FormField
              id="businessType"
              name="businessType"
              label="Business Type"
              value={formData.businessType}
              onChange={handleChange}
              error={errors.businessType}
              maxLength={60}
            />

            <FormField
              id="description"
              name="description"
              label="Description"
              textarea
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
              hint="20 to 400 characters"
              maxLength={400}
              rows={6}
              className="field-span-full"
            />

            <FormField
              id="title"
              name="title"
              label="Website Title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              maxLength={100}
            />

            <FormField
              id="tagline"
              name="tagline"
              label="Tagline"
              value={formData.tagline}
              onChange={handleChange}
              error={errors.tagline}
              maxLength={120}
            />

            <FormField
              id="about"
              name="about"
              label="About Section"
              textarea
              value={formData.about}
              onChange={handleChange}
              error={errors.about}
              hint="30 to 700 characters"
              maxLength={700}
              rows={6}
              className="field-span-full"
            />

            <FormField
              id="servicesText"
              name="servicesText"
              label="Services List"
              textarea
              value={formData.servicesText}
              onChange={handleChange}
              error={errors.servicesText}
              hint="Enter one service per line"
              rows={5}
              className="field-span-full"
            />

            {errorMessage ? <p className="banner banner-error">{errorMessage}</p> : null}
            {saveMessage ? <p className="banner banner-success">{saveMessage}</p> : null}

            <div className="button-row field-span-full">
              <button
                type="button"
                className="button"
                onClick={handleGenerate}
                disabled={isGenerating || isSaving}
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>

              <button type="submit" className="button button-accent" disabled={isSaving || isGenerating}>
                {isSaving ? 'Saving...' : savedWebsiteId ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </section>

        <section className="dashboard-section dashboard-preview-section">
          <div>
            <p className="eyebrow">Live Preview</p>
            <h3>See the generated website copy before you save</h3>
          </div>
          {isGenerating ? (
            <div className="generation-panel" role="status" aria-live="polite" aria-busy="true">
              <div className="generation-orb" aria-hidden="true">
                <span />
              </div>
              <div className="generation-copy">
                <p className="eyebrow">Generating</p>
                <h4>Shaping your draft now</h4>
                <p>
                  Building the title, tagline, about section, and service list so the preview can land with
                  context.
                </p>
              </div>
              <div className="generation-bars" aria-hidden="true">
                <span className="generation-bar generation-bar-long" />
                <span className="generation-bar" />
                <span className="generation-bar generation-bar-medium" />
              </div>
            </div>
          ) : !hasPreviewContent ? (
            <PageState
              compact
              title="Preview will appear here"
              message="Generate content to see the preview."
            />
          ) : (
            <>
              <WebsitePreviewCard website={previewWebsite} />
              {savedWebsiteId ? (
                <div className="inline-actions">
                  <Link to={`/websites/${savedWebsiteId}`} className="button button-secondary">
                    Open Draft
                  </Link>
                  <Link
                    to={`/websites/${savedWebsiteId}/view`}
                    target="_blank"
                    rel="noreferrer"
                    className="button button-secondary"
                  >
                    Open Website
                  </Link>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
