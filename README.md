# RxJS Type Notation

### Haskell-inspired notation for RxJS, co-authored by ChatGPT

**Read the documentation:** [netxpert.ch/rxjs-type-notation](https://netxpert.ch/rxjs-type-notation/)

An operator factory receives configuration and returns a transformation between streams:

```text
operator :: C → T* → R*
map      :: (T → R) → T* → R*
```

Here `T*` means `Observable<T>`. The notation makes the type relationship easy to read; the accompanying policy explains what happens over time, on cancellation, and when execution is shared.

This repository preserves the full analysis of adapting Haskell's concise type style to RxJS. It is a VitePress documentation project with a notation reference, a catalog of selected RxJS 7.8.2 operator forms, and compiler-checked TypeScript examples. The notation is a documentation convention; implementations continue to use ordinary RxJS.

## Read the guide

| Page | Purpose |
| --- | --- |
| [Why this notation?](docs/guide/why-this-notation.md) | Explain the contribution of currying, short type names, and implicit generic variables. |
| [Read a signature](docs/guide/reading-signatures.md) | Learn arrow grouping, partial application, pipelines, and actual JavaScript call shapes. |
| [Notation rules](docs/reference/notation.md) | Distinguish stream values, arrays, inner streams, tuples, and cardinality refinements. |
| [Operator catalog](docs/reference/operators.md) | Compare selected signatures with their behavior. |
| [Time, cancellation, and sharing](docs/guide/behavior.md) | Make execution and lifecycle policies explicit. |
| [Use it with TypeScript](docs/guide/typescript.md) | Keep concise aliases and the full RxJS API working together. |
| [Sources and scope](docs/reference/sources.md) | Find the pinned RxJS implementations and primary references. |

## Run locally

Use Node.js 24 or newer and npm. From the repository root:

```sh
npm ci
npm run dev
```

Open the local URL printed by VitePress, including the `/rxjs-type-notation/` base path.

```sh
npm run build       # Check TypeScript examples and build the documentation
npm run preview     # Preview the production build
npm run typecheck   # Check the examples independently
```

The equivalent `docs:dev`, `docs:build`, and `docs:preview` scripts are also available. `docs:build` builds only the documentation. The original Vite starter remains available through `app:dev`, `app:build`, and `app:preview`.

## Publication

The documentation is mounted at `/rxjs-type-notation/` within the existing [Hans Schenker portfolio](https://netxpert.ch/). Its source stays in this repository. The `hansschenker/hansschenker.github.io` deployment workflow checks out this repository, builds the documentation, and includes the resulting site in its Pages artifact.

After updating this repository, run the **Deploy VitePress (User Site)** workflow in the portfolio repository to publish the new version. A push to that portfolio's `main` branch also triggers its deployment. See [Build and publish](docs/maintaining.md).

## Contributors

- **[Hans Schenker](https://github.com/hansschenker)** — project author and maintainer.
- **ChatGPT (OpenAI)** — main contributor and co-author of the initial analysis, documentation, and examples.

The documentation credits ChatGPT in its subtitle and footer. See [CONTRIBUTORS.md](CONTRIBUTORS.md) for the contribution record.
