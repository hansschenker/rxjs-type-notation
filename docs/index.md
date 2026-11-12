---
layout: home
title: Succinct types for values over time

hero:
  name: RxJS Type Notation
  text: Succinct types. Explicit behavior.
  tagline: Haskell-inspired notation for values over time. Co-authored by ChatGPT, with Hans Schenker.
  actions:
    - theme: brand
      text: Start with the idea
      link: /guide/why-this-notation
    - theme: alt
      text: Read the operator catalog
      link: /reference/operators

features:
  - title: See what connects
    details: Read an operator as configuration, an input stream, and an output stream. T* stands for Observable<T>.
    link: /guide/reading-signatures
  - title: Keep behavior explicit
    details: The same type can support overlap, queuing, cancellation, or ignoring new values. Read the policy alongside the signature.
    link: /guide/behavior
  - title: Keep TypeScript working
    details: Use compact notation in explanations and short aliases where they help. Keep RxJS overloads and inference available in code.
    link: /guide/typescript
---

## One line for the shape

An operator factory receives configuration and returns a transformation from an input stream to an output stream:

```text
operator :: C → T* → R*
```

For `map`, the configuration is a function that transforms each arriving value:

```text
map :: (T → R) → T* → R*
```

Read it as: **provide a transformation from `T` to `R`; receive a transformation from a stream of `T` values to a stream of `R` values.** This follows the shape of RxJS's [`OperatorFunction<T, R>`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/types.ts), with the repeated `Observable` wording shortened to `*`.

## One more line for the policy

These four operators have the same Observable-only shape:

```text
(T → R*) → T* → R*
```

| Operator | What happens when another source value arrives? |
| --- | --- |
| `mergeMap` | Allow overlapping inner subscriptions, with the default concurrency. |
| `switchMap` | Unsubscribe the previous inner and follow the latest. |
| `concatMap` | Queue the value until the current inner completes. |
| `exhaustMap` | Ignore the value while an inner is active. |

The [operator catalog](/reference/operators) explains each selected form and links to its RxJS 7.8.2 implementation. The [behavior guide](/guide/behavior) explains completion, cancellation, clocks, and sharing.

## A practical reading order

1. [Why this notation?](/guide/why-this-notation) develops the full explanation from Haskell's concise types to RxJS's existing operator shape.
2. [Read a signature](/guide/reading-signatures) explains arrows, grouping, partial application, and pipelines.
3. [Notation rules](/reference/notation) defines streams, arrays, tuples, and cardinality precisely.
4. [Time, cancellation, and sharing](/guide/behavior) supplies the execution details a type cannot express.
5. [Use it with TypeScript](/guide/typescript) connects the notation to compiler-checked examples.

The notation is a proposal for reading and documenting RxJS. TypeScript remains the executable language, and the selected signatures describe **RxJS 7.8.2**. See [sources and scope](/reference/sources).
