export const registerValidator = (req) => {
  const { name, email, password, role } = req.body || {};
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("Name is required and must be at least 2 characters long");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
    errors.push("A valid email address is required");
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    errors.push("Password is required and must be at least 6 characters long");
  }

  if (role && !["user", "admin"].includes(role)) {
    errors.push("Role must be either 'user' or 'admin'");
  }

  if (errors.length > 0) {
    return { error: errors[0], errors };
  }

  return { error: null };
};

export const loginValidator = (req) => {
  const { email, password } = req.body || {};
  const errors = [];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
    errors.push("A valid email address is required");
  }

  if (!password || typeof password !== "string" || password.length === 0) {
    errors.push("Password is required");
  }

  if (errors.length > 0) {
    return { error: errors[0], errors };
  }

  return { error: null };
};
