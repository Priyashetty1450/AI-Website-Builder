import {
  AUTH_STORAGE_KEY,
  SESSION_STORAGE_KEY,
  USER_STORAGE_KEY,
  USERS_STORAGE_KEY,
  WEBSITES_STORAGE_KEY,
} from './storageKeys.js';

const NETWORK_DELAY = 550;

function wait() {
  return new Promise((resolve) => {
    window.setTimeout(resolve, NETWORK_DELAY);
  });
}

function readStorage(key, fallback) {
  const value = localStorage.getItem(key);

  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

function getUsers() {
  return readStorage(USERS_STORAGE_KEY, []);
}

function saveUsers(users) {
  writeStorage(USERS_STORAGE_KEY, users);
}

function getWebsites() {
  return readStorage(WEBSITES_STORAGE_KEY, []);
}

function saveWebsites(websites) {
  writeStorage(WEBSITES_STORAGE_KEY, websites);
}

function getSession() {
  return readStorage(SESSION_STORAGE_KEY, null);
}

function setSession(session) {
  writeStorage(SESSION_STORAGE_KEY, session);
  localStorage.setItem(AUTH_STORAGE_KEY, session.token);
}

function clearSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

function nextId(items) {
  return items.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
}

function createToken(userId) {
  return `mock-token-${userId}-${Date.now()}`;
}

function requireAuth(token) {
  const session = getSession();

  if (!session || !token || session.token !== token) {
    throw new Error('Your session has expired. Please log in again.');
  }

  const users = getUsers();
  const user = users.find((entry) => entry.id === session.userId);

  if (!user) {
    clearSession();
    throw new Error('Unable to find the current user.');
  }

  return sanitizeUser(user);
}

function findServicesByType(businessType) {
  const type = businessType.toLowerCase();

  if (type.includes('restaurant') || type.includes('cafe')) {
    return ['Online Reservations', 'Chef Specials', 'Private Dining Events'];
  }

  if (type.includes('agency') || type.includes('studio')) {
    return ['Brand Strategy', 'Creative Production', 'Growth Campaigns'];
  }

  if (type.includes('salon') || type.includes('spa')) {
    return ['Signature Treatments', 'Appointment Booking', 'Membership Packages'];
  }

  if (type.includes('fitness') || type.includes('gym')) {
    return ['Personal Coaching', 'Class Scheduling', 'Nutrition Plans'];
  }

  if (type.includes('ecommerce') || type.includes('retail') || type.includes('shop')) {
    return ['Featured Collections', 'Fast Checkout', 'Customer Support'];
  }

  if (type.includes('consult') || type.includes('service')) {
    return ['Discovery Calls', 'Tailored Solutions', 'Ongoing Support'];
  }

  return ['Featured Offering', 'Customer Experience', 'Dedicated Support'];
}

function buildTagline(businessName, businessType) {
  const descriptors = [
    'crafted for modern customers',
    'designed to stand out',
    'built for trust and growth',
    'made for memorable experiences',
  ];

  const descriptor = descriptors[businessName.length % descriptors.length];
  return `${businessType} solutions ${descriptor}.`;
}

function generateAbout(businessName, businessType, description) {
  const cleanDescription = description.trim().replace(/\s+/g, ' ');
  const summary = /[.!?]$/.test(cleanDescription) ? cleanDescription : `${cleanDescription}.`;
  return `${businessName} is a ${businessType.toLowerCase()} brand focused on ${summary} With a clear promise, polished presentation, and customer-first service, the business is positioned to turn visits into long-term relationships.`;
}

async function signup(payload) {
  await wait();

  const users = getUsers();
  const existingUser = users.find(
    (user) => user.email.toLowerCase() === payload.email.toLowerCase(),
  );

  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  const user = {
    id: nextId(users),
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  saveUsers(users);

  const token = createToken(user.id);
  const safeUser = sanitizeUser(user);
  setSession({ token, userId: user.id });
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(safeUser));

  return {
    token,
    user: safeUser,
  };
}

async function login(payload) {
  await wait();

  const users = getUsers();
  const user = users.find(
    (entry) =>
      entry.email.toLowerCase() === payload.email.toLowerCase() &&
      entry.password === payload.password,
  );

  if (!user) {
    throw new Error('The email or password is incorrect.');
  }

  const token = createToken(user.id);
  const safeUser = sanitizeUser(user);
  setSession({ token, userId: user.id });
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(safeUser));

  return {
    token,
    user: safeUser,
  };
}

async function getCurrentUser(token) {
  await wait();
  return requireAuth(token);
}

async function generateWebsite(payload, token) {
  await wait();
  requireAuth(token);

  const businessName = payload.businessName.trim();
  const businessType = payload.businessType.trim();
  const description = payload.description.trim();
  const services = findServicesByType(businessType);

  return {
    businessName,
    businessType,
    description,
    title: `${businessName} | ${businessType}`,
    tagline: buildTagline(businessName, businessType),
    about: generateAbout(businessName, businessType, description),
    services,
  };
}

async function saveWebsite(payload, token) {
  await wait();
  const user = requireAuth(token);
  const websites = getWebsites();
  const timestamp = new Date().toISOString();

  const website = {
    id: nextId(websites),
    userId: user.id,
    businessName: payload.businessName,
    businessType: payload.businessType,
    description: payload.description,
    title: payload.title,
    tagline: payload.tagline,
    about: payload.about,
    services: payload.services,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  websites.unshift(website);
  saveWebsites(websites);
  return website;
}

async function listWebsites({ page, pageSize }, token) {
  await wait();
  const user = requireAuth(token);
  const websites = getWebsites()
    .filter((website) => website.userId === user.id)
    .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt));

  const total = websites.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * pageSize;

  return {
    data: websites.slice(startIndex, startIndex + pageSize),
    meta: {
      page: safePage,
      pageSize,
      total,
      totalPages,
    },
  };
}

async function getWebsite(id, token) {
  await wait();
  const user = requireAuth(token);
  const websites = getWebsites();
  const website = websites.find(
    (entry) => String(entry.id) === String(id) && entry.userId === user.id,
  );

  if (!website) {
    throw new Error('Website not found.');
  }

  return website;
}

async function updateWebsite(id, payload, token) {
  await wait();
  const user = requireAuth(token);
  const websites = getWebsites();
  const index = websites.findIndex(
    (entry) => String(entry.id) === String(id) && entry.userId === user.id,
  );

  if (index < 0) {
    throw new Error('Website not found.');
  }

  const updatedWebsite = {
    ...websites[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  websites[index] = updatedWebsite;
  saveWebsites(websites);
  return updatedWebsite;
}

async function deleteWebsite(id, token) {
  await wait();
  const user = requireAuth(token);
  const websites = getWebsites();
  const nextWebsites = websites.filter(
    (entry) => !(String(entry.id) === String(id) && entry.userId === user.id),
  );

  if (nextWebsites.length === websites.length) {
    throw new Error('Website not found.');
  }

  saveWebsites(nextWebsites);
  return { success: true };
}

async function logout() {
  clearSession();
  return { success: true };
}

export {
  deleteWebsite,
  generateWebsite,
  getCurrentUser,
  getWebsite,
  listWebsites,
  login,
  logout,
  saveWebsite,
  signup,
  updateWebsite,
};
