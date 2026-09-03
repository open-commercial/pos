# Copilot instructions for this repository

## Build, test, and lint

- Install dependencies: `npm install`
- Run the local Angular dev server: `npm run start`
- Build the app: `npm run build`
- The CI workflow does the same with `npm install` followed by `npm run build` after setting `ENV_NAME=production`.
- There is no dedicated lint script in `package.json`, and `angular.json` does not define a `test` target. There are no `*.spec.ts` files in the project, so build validation is the baseline verification path unless a test runner is added later.
- For a single “test-like” check in the current repo, use the Angular build command above; there is no single-test command configured today.

## High-level architecture

- This is an Angular 20 single-page POS frontend. `angular.json` defines the `pos` app under `src` with the Angular application builder.
- Routing is minimal and centralized in `src/routes.ts`: `/login` is public, `/home` is protected by `authGuard`, and the app redirects empty and unknown paths to `/home`.
- Feature screens live under `src/app/components`: `login`, `home`, `products`, `checkout`, and the search dialogs. `HomeComponent` composes the product list and checkout experience.
- API and domain concerns are separated into `src/app/services` and `src/app/models`. Services handle HTTP calls, JWT/session handling, and business workflows such as products, orders, branches, and customers. Models define the request/response contracts consumed by those services.
- Auth is JWT-based. `AuthService` reads/writes the token from local storage and checks expiry via `JwtHelperService`; `authGuard` blocks access when the token is missing or expired. The backend base URL is configured in `src/environments/*.ts` (`http://localhost:8080` in development by default).
- The app is tightly coupled to a REST API expected at `/api/v1/*` routes, and it uses a browser-local token rather than an app-wide state store.

## Key conventions

- Components are Angular standalone components using `imports` arrays and file-based `templateUrl` / `styleUrls` metadata.
- Service injection is handled via `inject()` in many places rather than constructor-based DI.
- The business domain is Spanish/Argentine POS terminology (`producto`, `pedido`, `sucursal`, `cuenta corriente`, `usuario`, etc.), so naming and user-facing strings generally follow that domain language.
- Feature work is organized by screen and service responsibility rather than by NgModules; there is no module-per-feature layout in this repo.
- Changes that touch auth, order flows, product data, or customer branch state should be checked against both the relevant service and the matching model contract, because the frontend relies on a backend API with typed DTOs.
- `ENV_NAME` is required by the build script; builds should be run with it set in the shell when using the project script, especially in CI and production-like configurations.

## Project context

- README is intentionally minimal and points to the frontend role of the project, not a full developer guide.
- CI is defined in `.github/workflows/build.yml` and builds the Angular app on Node 22.12.0 before SonarCloud and release steps.
