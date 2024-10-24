# Alima Supplier React Typescript PWA

Repository implementing Alima's Supplier React Typescript Progressive Web App, as an extension of the create-react-app template. The app is meant to be an order management system (OMS), catalog management system (CMS), procurement & inventory tracker (ERP) for suppliers optimized for cross-platform usage.  


## Progressive Web App (PWA)

In order to activate installation for this app, it will be set from the Service Worker Registration. In order to allow PWA to be installable be sure to register the Service Worker in the `src/index.tsx` as follows:

```typescript
serviceWorkerRegistration.register();
```

To disable PWA functionality / installability unregister the Service Worker from the `src/index.tsx`:

```typescript
serviceWorkerRegistration.unregister();
```

## Commit Conventions

#### <a name="commit-header"></a>Commit Message Header

```
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope: animations|bazel|benchpress|common|compiler|compiler-cli|core|
  │                          elements|forms|http|language-service|localize|platform-browser|
  │                          platform-browser-dynamic|platform-server|router|service-worker|
  │                          upgrade|zone.js|packaging|changelog|docs-infra|migrations|
  │                          devtools
  │
  └─⫸ Commit Type: build|ci|docs|feat|fix|perf|refactor|test
```
The `<type>` and `<summary>` fields are mandatory, the `(<scope>)` field is optional.


## Deployment 

This is deployed statically using AWS S3 and AWS CloudFront. This is the process:

1. Create a release branch and annotate release
    ```
    git checkout -b release/<RELEASE_VERSION>
    git tag -a <RELEASE_VERSION> -m "Version release <RELEASE_VERSION>"
    ```
2. Create a production build
    ```bash
    # sourcing the corresponding env vars
    npm run build
    ```
3. Sync AWS S3 bucket 
    ```bash
    aws s3 sync --exclude ".git/*" --exclude ".gitignore" --exclude ".DS*" --exclude "*.sh" --exclude "*.md" ./build/ s3://<PROJECT_BUCKET>
    ```
4. Set Cloudfrount CDN invalidations
    ```bash
    aws cloudfront create-invalidation --distribution-id <PROJECT_ENV_DISTRO> --paths "/*"
    ```

## Development

### Available Scripts

#### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!\
For local serving a build you can use a static server, i.e.:

```bash
# npm install -g serve
serve -s build
```

