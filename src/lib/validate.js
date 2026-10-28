/**
 * Form validation — returns an errors object keyed by field name.
 * Empty object means valid. Kept UI-free so it can be unit-tested.
 */

export function validateStudent(data) {
  const errors = {};
  const name = (data.name || "").trim();
  if (!name) errors.name = "Name is required.";
  else if (name.length < 2) errors.name = "Name looks too short.";

  if (!(data.course || "").trim()) errors.course = "Course is required.";

  const year = Number(data.year);
  if (!Number.isInteger(year) || year < 1 || year > 5) errors.year = "Year must be between 1 and 5.";

  const phoneRe = /^[+\d][\d\s-]{6,17}$/;
  const phone = (data.phone || "").trim();
  if (!phone) errors.phone = "Phone number is required.";
  else if (!phoneRe.test(phone)) errors.phone = "Enter a valid phone number, e.g. +91 98110 22334.";

  const email = (data.email || "").trim();
  if (!email) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";

  if (!data.dob) errors.dob = "Date of birth is required.";
  if (!(data.address || "").trim()) errors.address = "Home address is required.";
  if (!(data.guardianName || "").trim()) errors.guardianName = "Guardian name is required.";

  const gPhone = (data.guardianPhone || "").trim();
  if (!gPhone) errors.guardianPhone = "Guardian phone is required.";
  else if (!phoneRe.test(gPhone)) errors.guardianPhone = "Enter a valid phone number.";
  return errors;
}

export function validateComplaint(data) {
  const errors = {};
  if (!(data.title || "").trim()) errors.title = "Give the issue a short title.";
  else if (data.title.trim().length < 4) errors.title = "Title looks too short.";
  if (!(data.description || "").trim()) errors.description = "Describe the issue.";
  else if (data.description.trim().length < 10) errors.description = "Add a little more detail (10+ characters).";
  if (!data.category) errors.category = "Pick a category.";
  if (!data.priority) errors.priority = "Pick a priority.";
  return errors;
}

export function validateAnnouncement(data) {
  const errors = {};
  if (!(data.title || "").trim()) errors.title = "Title is required.";
  if (!(data.body || "").trim()) errors.body = "Write the announcement body.";
  else if (data.body.trim().length < 10) errors.body = "Add a little more detail (10+ characters).";
  return errors;
}

export function validateMeal(data) {
  const errors = {};
  if (!(data.text || "").trim()) errors.text = "Menu text is required.";
  return errors;
}
