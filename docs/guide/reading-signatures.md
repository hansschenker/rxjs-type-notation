---
title: Reading signatures
description: Read configuration, functional arguments, grouped parameters, and composition in the proposed RxJS notation.
---

# Reading signatures

A signature is a compact map of the inputs a function needs and the result it provides. Start by identifying the dataflow at the end, then examine the configuration that produces it:

```text
operator :: C → T* → R*
```

The returned operator transforms `T*` into `R*`. The configuration `C` selects its rule. Our [notation reference](/reference/notation) defines `T*` as `Observable<T>`; the star does not promise a finite list, asynchronous execution, or successful completion.

## Read the arrows from their grouping

Arrows associate to the right:

```text
C → T* → R*

means

C → (T* → R*)
```

The outer function accepts configuration and returns another function. That returned function accepts the source. Parentheses can make this structure explicit without changing it. This convention follows Haskell's function-type notation. [Haskell Report, function types](https://www.haskell.org/onlinereport/haskell2010/haskellch4.html)

It does not mean `(C → T*) → R*`. That alternative accepts a function as its first input and describes a different relationship.

## A function can itself be configuration

For `map`, the configuration is a projection:

```text
map :: (T → R) → T* → R*
```

The parentheses around `T → R` matter. They identify **one function-valued argument**. Without them, `T → R → T* → R*` would describe successive inputs of types `T` and `R` before the source.

| Part | Reading |
| --- | --- |
| `map` | The operator factory being described |
| `::` | Has the following type shape |
| `(T → R)` | A projection from one input value to one result |
| `T*` | The source Observable |
| `R*` | The resulting Observable |

Supplying the projection specializes the factory and leaves a function of type `T* → R*`. This resembles partial application: a general operation becomes one configured for a particular transformation. In RxJS it is an explicit factory call, already implemented by the API. [RxJS 7.8.2 map](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/map.ts)

## Preserve grouped JavaScript arguments

Consider a seeded accumulation. Each arriving value combines with remembered state to produce the next state. The introductory signature is:

```text
Reducer S T = (S, T) → S

scan :: (Reducer S T, S) → T* → S*
```

There are two distinct groupings. The factory receives a reducer and a seed in one call. The reducer receives the current state and arriving value together in another call. Here a comma-separated argument group documents several JavaScript parameters; it does **not** instruct the caller to pass a single array or tuple value.

This describes the common seeded case in which seed and accumulated state have the same type. RxJS 7.8.2 also supports an unseeded form and a seed type differing from the accumulated type. Its reducer receives an index as a third argument. Those overloads and that index are deliberately omitted from this introductory signature. [RxJS 7.8.2 scan](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/scan.ts)

### Fully curried normalization is another view

We can express the same roles in a hypothetical interface that accepts every argument separately:

```text
CurriedReducer S T = S → T → S

scanCurried :: CurriedReducer S T → S → T* → S*
```

This is a Haskell-inspired normalization, requiring an adapter in JavaScript. A curried reducer takes a state and returns a function waiting for a value. The actual RxJS reducer takes both arguments together. Likewise, the actual factory uses `scan(reducer, seed)`, not `scan(reducer)(seed)`.

The normalized form clarifies dependencies, while the grouped form documents the existing calling convention. Neither notation silently changes the library.

## Expand a simplification when it matters

The shortest signature is a teaching view, not the full overload set. A more detailed ordinary projection includes its source-emission index:

```text
IndexedProjection T R = (T, Number) → R

map :: IndexedProjection T R → T* → R*
```

For the seeded `scan` view, the analogous reducer is `(S, T, Number) → S`. Indexing is per subscription. Both operators start their relevant counter at zero; the unseeded `scan` form has additional first-value behavior described in its source.

An ordinary `filter` predicate preserves the declared element type, but a TypeScript type guard can narrow it. Its short Boolean-predicate signature therefore does not represent every overload. Deprecated `thisArg` forms and other optional arguments must also be identified when omitted. Consult the [operator reference](/reference/operators) and [RxJS filter source](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/filter.ts) when those distinctions matter.

## Compose compatible dataflows

Suppose two configured operators have these types:

```text
first  :: T* → R*
second :: R* → U*

combined :: T* → U*
```

Their intermediate type matches: `first` supplies the Observable shape that `second` accepts. Function composition applies `first`, then `second`; mathematical composition would write that order as `second ∘ first`. RxJS's `pipe` lists the stages in the order values encounter them.

Compatible types establish a useful connection, not a complete behavioral contract. Composition may introduce state, timing rules, cancellation, or sharing according to the selected operators. The [behavior guide](/guide/behavior) explains why identical signatures can support different policies.

## Read a complete TypeScript pipeline

The following source emits three numbers synchronously for each subscription. A pure projection doubles them; a pure reducer maintains their running total. The result emits `2`, `6`, and `12`, then completes.

```ts
import { map, of, scan } from 'rxjs';
import type { Observable, OperatorFunction } from 'rxjs';

type Reducer<S, T> = (state: S, value: T) => S;

const double = (value: number): number => value * 2;
const add: Reducer<number, number> = (state, value) => state + value;

const doubleValues: OperatorFunction<number, number> = map(double);
const runningTotal: OperatorFunction<number, number> = scan(add, 0);

const source$: Observable<number> = of(1, 2, 3);
const result$: Observable<number> = source$.pipe(
  doubleValues,
  runningTotal,
);

const connection = result$.subscribe({
  next: value => console.log(value),
});
// Completion closes this finite subscription automatically.
```

The seed initializes the accumulation; `scan` does not emit it just because a consumer subscribes. Each subscription gets its own accumulation. This example neither shares execution nor replays state to another consumer. Its timing comes from the synchronous source, and these two operators add no scheduler.

For a longer-lived source, closing `connection` would close this pipeline's subscription and run its registered teardown. That lifetime decision is separate from its `number* → number*` type shape.

The practical reading sequence is therefore: identify the configuration, check argument grouping, follow the element types, and then inspect the execution policy. Continue to the [TypeScript guide](/guide/typescript) for expanded declarations and the [operator reference](/reference/operators) for more signatures.
