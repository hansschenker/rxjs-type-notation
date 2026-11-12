# Use the notation with TypeScript

The notation can make documentation shorter immediately. In application code, a few aliases can express the same relationships while TypeScript continues to check the values flowing through the pipeline.

The practical approach has three parts: use compact signatures to explain connections, keep the ordinary RxJS imports in implementation code, and introduce aliases only where the same type shape is repeated. This gives readers the short form while retaining the full overload information of the library.

## What becomes shorter?

A configured operator accepts an Observable and returns an Observable. RxJS already names this relationship `OperatorFunction<T, R>`. Its mono-type variant preserves the emitted value type, without promising the same emission count, timing, or sharing behavior. These relationships are defined in the [RxJS 7.8.2 type declarations](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/types.ts).

| Documentation notation | Short TypeScript alias | Existing RxJS type |
| --- | --- | --- |
| `T*` | `O<T>` | `Observable<T>` |
| `T → R` | `Fn<T, R>` | `(value: T) => R` |
| `T* → R*` | `Op<T, R>` | `OperatorFunction<T, R>` |
| `T* → T*` | `Op<T>` | `MonoTypeOperatorFunction<T>` |
| `T → Bool` | `Pred<T>` | `(value: T) => boolean` |
| `(S, T) → S` | `Reducer<S, T>` | `(state: S, value: T) => S` |

`Op<T>` uses a default result parameter equal to `T`. The alias is structural: a function with the matching source and result types fits it. It adds no subscription, scheduler, allocation of an Observable, or new runtime behavior.

## Keep generic relationships visible

The important information in `map` is the relationship between three things: the projection's input, the source's emitted values, and the result's emitted values. Type parameters preserve that relationship.

```text
map :: (T → R) → T* → R*
```

Writing everything as `unknown` would erase the relationship between the source and projection rather than express a generic factory. The alias should quantify `T` and `R` on the callable signature. The [TypeScript generics handbook](https://www.typescriptlang.org/docs/handbook/2/generics.html) explains why generic parameters carry information from inputs to outputs.

Keep factory types and configured operator types distinct. `Map` below describes the function that accepts a projection; `Op<T, R>` describes what that call returns.

## Preserve full overloads at the use site

The short `Filter` alias below shows a Boolean predicate. RxJS also has type-guard overloads that can narrow the output type. The short `Map` alias shows a unary projection, while the library supplies both the current value and its index. Those short views are useful for teaching and selected contracts; annotating every imported operator with them would hide useful API detail.

For application pipelines, import `map`, `filter`, and other operators from `rxjs` as usual. Inference then uses their actual declarations. If a helper benefits from an explicit signature, annotate that helper with `Op<T, R>`.

The examples use TypeScript's `satisfies` operator to check that actual RxJS factories support the simplified views while retaining their inferred types. This is the behavior described in the [TypeScript 4.9 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator).

## Currying is a reading rule and an API choice

`map(project)` already produces an operator that can later receive a source. That naturally supports the short two-stage type. An operator such as `scan` takes its reducer and seed together in one JavaScript call. The aliases preserve that actual call shape.

Fully currying every multi-argument operator would require another runtime API and another inference design. It would also change how callers supply configuration. The notation does not require that change. See [read a signature](/guide/reading-signatures) for the distinction between the normalized Haskell-style view and the actual RxJS call.

Likewise, JavaScript user functions do not become pure because their types look like Haskell's. Keep transformations and reducers pure by design; an ordinary TypeScript function type does not prohibit mutation or external effects.

## What the example flows do

The first example starts with a cold, synchronous source of `1`, `2`, and `3`. On subscription, each value is doubled; values below `4` are removed; the remaining numbers become labels. It emits `Value 4` and `Value 6`, then completes. No clock or sharing operator is introduced. Each subscription runs this cold flow independently.

The state example receives `Change` values. `scan` updates the accumulated number for each change. `startWith(0)` explicitly supplies the initial state because seeded `scan` does not emit its seed by itself. `shareReplay` gives concurrent subscribers a shared state computation and replays the latest result to later subscribers.

Its chosen `refCount: true` policy closes the active upstream connection when the final subscriber leaves before completion. A later subscription can start a new connection and rebuild state from the seed, subject to the source's own behavior. Successful completion is retained in the replayed result. This lifecycle follows the [RxJS 7.8.2 `shareReplay` implementation](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/shareReplay.ts), so `scan + shareReplay` alone is not a promise of permanent storage.

The final two functions use the same request and reply types. `onlyLatest` changes inner subscriptions on a new request; `queueInOrder` waits for the current inner to complete. The request producer determines when replies arrive and whether teardown can stop the external operation. The [behavior guide](/guide/behavior) explains those policies.

## Compiler-checked code

The example snippets below are included directly from the repository's `examples` directory and checked by `npm run typecheck`. They use RxJS 7.8.2. Reading them or constructing these pipelines does not subscribe to their outputs.

### From the library declaration to a compact view

The principal non-deprecated `map` overload has this declaration shape, with `OperatorFunction` imported as a type from `rxjs`:

```ts
declare function map<T, R>(
  project: (value: T, index: number) => R,
): OperatorFunction<T, R>;
```

Expanding the operator's source and result types makes the repeated structure visible:

```text
((T, Index) → R) → Observable<T> → Observable<R>
```

Abbreviating the Observable type preserves the indexed form:

```text
((T, Index) → R) → T* → R*
```

When the projection ignores its index, the common teaching view is:

```text
(T → R) → T* → R*
```

The final step is an explicitly chosen specialization; the index still exists in the actual [RxJS `map` API](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/map.ts).

### Short aliases

<<< ../../examples/type-aliases.ts#aliases

### More precise views

Use these when callback indices, narrowing, or broader producer inputs are relevant:

<<< ../../examples/type-aliases.ts#precision

`Guard<T, R>` encodes an actual TypeScript type predicate. `Input<R>` uses RxJS's official union for supported input producers. The latter describes an accepted value source; it does not establish that the underlying operation can be aborted.

### A pipeline and a reusable operator

The complete file imports `of`, `map`, and `filter` from `rxjs`, and `Op` from the alias file.

<<< ../../examples/dataflows.ts#pipeline

### Keep the library's narrowing overload

This pipeline uses the original `filter` import, allowing the type predicate to narrow `Message` before the next projection:

<<< ../../examples/dataflows.ts#narrowing

### State with explicit sharing

The complete file also imports `scan`, `startWith`, and `shareReplay` from `rxjs`, with `Observable` as a type import.

<<< ../../examples/dataflows.ts#state

### The same shape, different subscription policies

The complete file imports `switchMap` and `concatMap` from `rxjs`.

<<< ../../examples/dataflows.ts#policies

For the complete imports and the factory compatibility check, see [dataflows.ts](https://github.com/hansschenker/rxjs-type-notation/blob/main/examples/dataflows.ts) and [type-aliases.ts](https://github.com/hansschenker/rxjs-type-notation/blob/main/examples/type-aliases.ts).
