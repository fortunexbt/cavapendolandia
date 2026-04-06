/**
 * Feature Flags Module
 * 
 * Reads feature flag values from environment variables prefixed with VITE_FEATURE_*
 * to enable/disable features at build time.
 * 
 * Usage:
 *   VITE_FEATURE_PAGES_CMS=true      - Enable CMS-managed pages
 *   VITE_FEATURE_PRATO_EDITOR=true   - Enable prato/editor functionality
 *   VITE_FEATURE_VISITOR_MESSAGES=true - Enable visitor messages feature
 *   VITE_FEATURE_I18N=true            - Enable internationalization
 */

/** Enable CMS-managed pages */
export const pagesCms: boolean = 
  import.meta.env.VITE_FEATURE_PAGES_CMS === 'true';

/** Enable prato/editor functionality */
export const pratoEditor: boolean = 
  import.meta.env.VITE_FEATURE_PRATO_EDITOR === 'true';

/** Enable visitor messages feature */
export const visitorMessages: boolean = 
  import.meta.env.VITE_FEATURE_VISITOR_MESSAGES === 'true';

/** Enable internationalization */
export const i18n: boolean = 
  import.meta.env.VITE_FEATURE_I18N === 'true';
