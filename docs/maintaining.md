# Build and publish

The Markdown pages, theme configuration, and examples live in [`hansschenker/rxjs-type-notation`](https://github.com/hansschenker/rxjs-type-notation). The documentation is published as part of the existing portfolio at **[netxpert.ch/rxjs-type-notation/](https://netxpert.ch/rxjs-type-notation/)**.

## Local development

Use Node.js 24 or newer and install the exact dependency versions from the lockfile:

```sh
npm ci
npm run dev
```

The documentation root is `docs`. The VitePress config is `docs/.vitepress/config.mts`, and the custom footer is `docs/.vitepress/theme/Layout.vue`. The original Vite starter is available through the `app:*` scripts.

## Validate a change

```sh
npm run build
npm run preview
```

`build` first checks `examples/*.ts` with strict TypeScript settings, then builds the documentation. VitePress also rejects unresolved internal document links. Preview the output at the printed local URL, including `/rxjs-type-notation/`.

The source repository's **Check documentation** workflow runs the same build for pull requests and pushes to `main`. The TypeScript page includes snippets directly from the example files, so those displayed snippets and the checked code share a source.

## Publish through the existing portfolio

The [`hansschenker/hansschenker.github.io`](https://github.com/hansschenker/hansschenker.github.io) repository already deploys the `netxpert.ch` portfolio through GitHub Pages. Its **Deploy VitePress (User Site)** workflow builds the portfolio, checks out this notation repository, builds these docs, and copies the result into the portfolio artifact at `rxjs-type-notation/`.

After changes reach this repository's `main` branch:

1. Open [the portfolio deployment workflow](https://github.com/hansschenker/hansschenker.github.io/actions/workflows/pages.yml).
2. Choose **Run workflow** on `main`.
3. Wait for its build and deployment jobs to succeed.
4. Open [the published documentation](https://netxpert.ch/rxjs-type-notation/) and check the changed page.

A push to the portfolio's own `main` branch also triggers this workflow. A source-only change in the notation repository runs its checks but does not automatically trigger a workflow in a different repository.

The VitePress `base` remains `/rxjs-type-notation/`. The existing portfolio owns the `netxpert.ch` domain configuration, so this repository does not need its own `CNAME` or separate Pages deployment. The [VitePress deployment guide](https://vuejs.github.io/vitepress/v1/guide/deploy) explains why the base path must match the published location.

## Extend the reference

For each new operator entry, state the selected form and describe what flows, what happens on a new value, and why the operator is useful. Include time, completion, error, cancellation, and sharing rules where they affect the choice. Link to the corresponding RxJS source at the documented version.

Keep a curried normalization labeled separately from actual JavaScript argument grouping. Reserve `T?`, `T!`, and `T+` for the explicit cardinality conventions in the [notation reference](/reference/notation).
