/** e.g. `j***@example.com` */
export function maskEmail(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.indexOf('@');
  if (at <= 0) return '***';
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at);
  if (local.length === 0) return `***${domain}`;
  return `${local[0]}***${domain}`;
}
