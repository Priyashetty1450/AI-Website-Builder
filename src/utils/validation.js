function isBlank(value) {
  return !value || !String(value).trim();
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateLength(value, min, max) {
  const count = value.trim().length;
  return count >= min && count <= max;
}

export function buildServicesArray(servicesText) {
  return servicesText
    .split('\n')
    .map((service) => service.trim())
    .filter(Boolean);
}

export function validateLoginForm(formData) {
  const errors = {};

  if (isBlank(formData.email)) {
    errors.email = 'Email is required.';
  } else if (!isEmail(formData.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (isBlank(formData.password)) {
    errors.password = 'Password is required.';
  }

  return errors;
}

export function validateSignupForm(formData) {
  const errors = {};

  if (isBlank(formData.name)) {
    errors.name = 'Full name is required.';
  } else if (!validateLength(formData.name, 2, 60)) {
    errors.name = 'Name must be between 2 and 60 characters.';
  }

  if (isBlank(formData.email)) {
    errors.email = 'Email is required.';
  } else if (!isEmail(formData.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (isBlank(formData.password)) {
    errors.password = 'Password is required.';
  } else if (!validateLength(formData.password, 8, 64)) {
    errors.password = 'Password must be between 8 and 64 characters.';
  }

  if (isBlank(formData.confirmPassword)) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

export function validateGenerationForm(formData) {
  const errors = {};

  if (isBlank(formData.businessName)) {
    errors.businessName = 'Business name is required.';
  } else if (!validateLength(formData.businessName, 2, 80)) {
    errors.businessName = 'Business name must be between 2 and 80 characters.';
  }

  if (isBlank(formData.businessType)) {
    errors.businessType = 'Business type is required.';
  } else if (!validateLength(formData.businessType, 2, 60)) {
    errors.businessType = 'Business type must be between 2 and 60 characters.';
  }

  if (isBlank(formData.description)) {
    errors.description = 'Description is required.';
  } else if (!validateLength(formData.description, 20, 400)) {
    errors.description = 'Description must be between 20 and 400 characters.';
  }

  return errors;
}

export function validateWebsiteForm(formData) {
  const errors = {
    ...validateGenerationForm(formData),
  };

  if (isBlank(formData.title)) {
    errors.title = 'Website title is required.';
  } else if (!validateLength(formData.title, 3, 100)) {
    errors.title = 'Website title must be between 3 and 100 characters.';
  }

  if (isBlank(formData.tagline)) {
    errors.tagline = 'Tagline is required.';
  } else if (!validateLength(formData.tagline, 5, 120)) {
    errors.tagline = 'Tagline must be between 5 and 120 characters.';
  }

  if (isBlank(formData.about)) {
    errors.about = 'About section is required.';
  } else if (!validateLength(formData.about, 30, 700)) {
    errors.about = 'About section must be between 30 and 700 characters.';
  }

  const services = buildServicesArray(formData.servicesText || '');

  if (services.length === 0) {
    errors.servicesText = 'Add at least one service.';
  } else if (services.some((service) => service.length < 3 || service.length > 80)) {
    errors.servicesText = 'Each service must be between 3 and 80 characters.';
  }

  return errors;
}
