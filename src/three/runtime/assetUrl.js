// Public assets must stay under the application's base path on GitHub Pages.
export const assetUrl = path => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
