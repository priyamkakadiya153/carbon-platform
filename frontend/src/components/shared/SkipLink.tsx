/**
 * SkipLink — WCAG 2.1 AA skip navigation link.
 *
 * Visually hidden by default. Becomes visible on keyboard focus,
 * allowing keyboard and screen reader users to skip repetitive navigation.
 */
export const SkipLink = () => (
  <a
    href="#main-content"
    className="skip-link"
  >
    Skip to main content
  </a>
);
