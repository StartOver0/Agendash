// // elysia.d.ts

// declare module "elysia" {
//   export interface Context {
//     oidc: {
//       getUser: () => Promise<any>;
//       getTokenClaims: () => Promise<any>;
//       isAuthenticated: () => Promise<boolean>;
//       login: (options?: { returnTo: string }) => Promise<Response>;
//       logout: () => string;
//       callback: () => Promise<Response>;
//       getIssuerMetadata: () => unknown;
//       getLastRefreshTime: () => number;
//       refreshConfig: () => Promise<boolean>;
//     };
//     userId: string | null;
//   }
// }
  