---
title: Why this notation
description: How Haskell-inspired signatures make the configuration and dataflow of RxJS operators easier to read.
---

# Why this notation

An RxJS operator has a reusable job: accept a source dataflow and describe a result dataflow. Its configuration determines how values are transformed, selected, accumulated, or routed as they arrive. A short signature can make those relationships visible before we examine implementation details.

The foundation of this project is:

```text
operator :: C → T* → R*
```

Read it as **configure the operator with `C`, then supply values of type `T` over time, to obtain values of type `R` over time**. Here, `T*` means `Observable<T>` and `R*` means `Observable<R>`. An arrow describes a function relationship; it does not represent elapsed time.

This is proposed documentation notation. It is neither valid TypeScript nor literal Haskell syntax, and it introduces no new runtime or operator API. The [notation reference](/reference/notation) defines its conventions.

## The Haskell connection

Haskell makes a function's structure visible in a compact type signature. For example, its list transformation has the familiar shape:

```haskell
map :: (a -> b) -> [a] -> [b]
```

The projection transforms one element. The remaining function transforms a list. Our corresponding RxJS view is:

```text
map :: (T → R) → T* → R*
```

The resemblance helps explain the separation between **a function describing one value** and **an operator applying that function across a dataflow**. The domain rules belong in the supplied projection. The operator provides the reusable processing structure.

The distinction between lists and Observables remains essential. An Observable carries notifications over an execution that may be synchronous or asynchronous, supports completion and error, and gives its consumer a subscription that can be closed. The star is our abbreviation for that existing RxJS abstraction, not a claim that it is a Haskell list.

The Haskell Report documents right-associative function arrows, implicit type variables, and list type syntax. This project borrows the readability of those conventions while defining its own Observable symbol and uppercase type variables. [Haskell Report, types](https://www.haskell.org/onlinereport/haskell2010/haskellch4.html)

## Four choices make the signature shorter

Currying explains part of the structure, but several choices contribute to the compact presentation:

| Choice | What it contributes |
| --- | --- |
| Function arrows | Expose a function that returns another function |
| A short type constructor | Replace repeated `Observable<T>` expressions with `T*` |
| Implicit type variables | Avoid repeating a generic declaration such as `<T, R>` |
| Omitted parameter names | Show the relationships between types without labels such as `project` and `source` |

The symbols `T` and `R` mean that the pattern applies to different value types. They do not name particular runtime values. Repeating `T` links occurrences of the same type within the signature; changing to `R` allows the output element type to differ.

Removing parameter names also removes some explanatory information. A signature should therefore be accompanied by a sentence identifying each argument's role. Naming a type such as `Predicate T` or `Reducer S T` can help when the expanded function type becomes difficult to scan.

## RxJS already separates configuration from the source

The notation exposes a structure already present in pipeable RxJS operators. A call to an operator factory configures processing and returns an operator function. That returned function accepts the source Observable and returns another Observable. RxJS calls this returned type `OperatorFunction<T, R>`. [RxJS 7.8.2 types](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/types.ts)

For `map`, configuration is a projection function. After supplying it, the remaining type is:

```text
T* → R*
```

This explains why a configured operator can be stored, reused, or placed in a pipeline. Configuration chooses the rule; subscription connects a consumer to the resulting dataflow.

The pattern does not mean JavaScript automatically curries every argument. Factories such as `scan` accept several configuration arguments together. In the general signature, `C` can represent that entire configuration group. The [reading guide](/guide/reading-signatures) explains how to preserve that grouping.

## A type shape introduces a behavioral question

The short signatures let a reader identify useful differences quickly:

```text
map    :: (T → R) → T* → R*
filter :: (T → Bool) → T* → T*
```

The projection can change the value type. The ordinary predicate decides whether an input continues downstream while preserving its type. These are introductory views: `map` also passes an index, while `filter` includes indexed predicates and overloads that narrow types. The [operator reference](/reference/operators) records the scope of each simplification.

Types alone cannot say how many values arrive, when they arrive, or which subscriptions are canceled. Several flattening operators can share a type shape while applying different policies: allow overlap, queue, keep only the latest, or ignore new work while busy. These differences belong in the [behavior guide](/guide/behavior).

## Keep execution visible

For each example, identify its source, subscription lifetime, and sharing policy separately. A short signature does not declare an Observable cold, shared, or replaying. It also does not establish that a supplied JavaScript function is pure; purity is a useful design choice for domain transformations, not something this notation enforces.

Timing comes from producers and schedulers. Operators can coordinate delivery using those facilities, but a type arrow carries no scheduling guarantee. Likewise, canceling a subscription closes that connection; whether an underlying resource stops depends on its teardown and any other consumers.

## The same idea in TypeScript

This complete example makes the factory and source stages explicit:

```ts
import { map, of } from 'rxjs';
import type { Observable, OperatorFunction } from 'rxjs';

const double = (value: number): number => value * 2;

const doubleValues: OperatorFunction<number, number> = map(double);
const source$: Observable<number> = of(10, 20, 30);
const result$: Observable<number> = doubleValues(source$);

const connection = result$.subscribe({
  next: value => console.log(value),
});
// Prints 20, 40, 60 synchronously, then completes.
// The completed subscription is already closed.
```

The equivalent pipeline expression is `source$.pipe(doubleValues)`. This source is cold: each subscription runs its sequence independently. Nothing here shares execution or replays earlier values. `map` forwards each successful projection result during source notification handling; it adds no scheduling delay. [RxJS 7.8.2 map](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/map.ts)

The [TypeScript guide](/guide/typescript) expands these compact signatures into declarations and executable examples. Together, the two views connect a readable description of the dataflow with the types and behavior of the actual library.
