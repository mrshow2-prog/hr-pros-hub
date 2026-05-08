// Slugs that resolve to a profile page (rendered by ProfileRouter).
// Used to hide global widgets (WhatsApp button, default site assistant)
// on those routes.
export const PROFILE_SLUGS = new Set<string>([
  "chef-m-khalil",
  "bishoy-mesiha",
]);

export function getProfileSlugFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/([^/]+)\/?$/);
  if (!m) return null;
  const slug = m[1];
  return PROFILE_SLUGS.has(slug) ? slug : null;
}
