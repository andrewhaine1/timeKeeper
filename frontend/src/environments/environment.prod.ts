export const environment = {
  production: true,
  // Empty string = relative URLs. nginx (in Docker / prod) proxies
  // /api/* → http://api:3000  (Docker service name).
  apiUrl: '',
};
