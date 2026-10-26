export function validatePasswordChange(password: string, confirmation: string) {
  if (password.length < 8) return "Use at least 8 characters for your new password.";
  if (password !== confirmation) return "The new passwords do not match.";
  return null;
}