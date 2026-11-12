# Notation rules

The central convention is **`T*` means `Observable<T>`**. An operator's signature shows which kinds of values can flow through it. Timing, subscription lifetime, and sharing remain part of its accompanying behavior description.

This is Haskell-inspired documentation notation. Symbols such as `T*` are conventions defined here; the signatures are neither TypeScript declarations nor literal Haskell source.

## The basic vocabulary

| Notation | Read it as | TypeScript connection |
| --- | --- | --- |
| `T`, `R`, `S`, `U` | Input, result, state, or another generic type | Type parameters |
| `Bool` | A Boolean value | `boolean` |
| `T → R` | A function accepting `T` and returning `R` | `(value: T) => R` |
| `T*` | A stream of `T` values | `Observable<T>` |
| `Op T R` | A transformation from a stream of `T` to a stream of `R` | `OperatorFunction<T, R>` |
| `Op T T` | A transformation preserving the emitted value type | `MonoTypeOperatorFunction<T>` |
| `C` | The chosen operator configuration | One parameter or a group of parameters |
| `A × B` | A product containing an `A` and a `B` | Depends on the documented representation |
| `A \| B` | Either type of value | `A \| B` |
| `Input<R>` | Any supported input producing values of `R` | `ObservableInput<R>` |

These aliases follow the [RxJS type declarations](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/types.ts). Repeated type variables express a relationship: the `T` received by a projection is the `T` emitted by its source. Generic variables are implicitly quantified over the scope of the displayed signature. Constraints and overload choices must be stated when needed.

`T*` permits zero or more `next` notifications, potentially without end. It does not specify whether delivery is synchronous or asynchronous, whether the source eventually terminates, or whether execution is independent or shared. The Observable notification protocol still applies: after `complete` or `error`, no more notifications are delivered to that subscriber. See the [Observable guide](https://rxjs.dev/guide/observable).

## Arrow and application rules

Arrows associate to the right:

```text
A → B → C  ≔  A → (B → C)
```

A function passed as an argument needs parentheses:

```text
(T → R) → T* → R*
```

This accepts a transformation first. Without those parentheses, `T → R → T* → R*` would describe a different sequence of arguments.

Suffixes bind more tightly than arrows. Type constructor application binds more tightly too: `Op T R` is one type expression. Parentheses can always make the grouping explicit. ASCII `->` is an acceptable spelling of `→`; use one spelling consistently within a page.

These arrow rules are borrowed from the [Haskell 2010 Report's treatment of types](https://www.haskell.org/onlinereport/haskell2010/haskellch4.html). The stream suffixes are this project's own display convention.

## Preserve actual JavaScript grouping

Use commas for arguments supplied **together** in one JavaScript call:

```text
Reducer S T ≔ (S, T) → S

scan :: (Reducer S T, S) → T* → S*
```

Here `(Reducer S T, S)` represents the reducer and seed passed together to the factory. It does not instruct the caller to create a JavaScript array. Similarly, `(S, T) → S` represents a two-argument function.

A fully curried normalization is also useful, provided it is labeled:

```text
Curried normalization:
scan :: (S → T → S) → S → T* → S*
```

The normalized reading explains dependencies; the [actual RxJS `scan` call](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/scan.ts) supplies reducer and seed together. See [read a signature](/guide/reading-signatures).

## Arrays, tuples, and inner streams

Use `T[]` for an array payload and `[A, B]` for a tuple. Parenthesize compound payloads when adding a stream suffix.

| Notation | What arrives as one outer value? | TypeScript |
| --- | --- | --- |
| `T[]` | An array value, without an outer stream | `T[]` |
| `(T[])*` | An array of `T` values | `Observable<T[]>` |
| `[A, B]*` | A tuple containing an `A` and a `B` | `Observable<[A, B]>` |
| `(T*)*` | An Observable of `T` values | `Observable<Observable<T>>` |

An array holds values already collected. An inner Observable describes another flow with its own subscription lifetime. Whether that inner flow is live, replayed, or independently produced must be stated in the operator's policy. The [buffer and window entries](/reference/operators) show why the distinction matters.

## Cardinality is an optional refinement

The following suffixes count `next` notifications for **one subscription**:

| Suffix | Proposed refinement | What it does not establish |
| --- | --- | --- |
| `T*` | Zero or more values | Eventual completion or any minimum count |
| `T?` | At most one value | That the stream will terminate or emit a value |
| `T!` | Exactly one value, under stated conditions | A guarantee in the face of error, cancellation, or nontermination |
| `T+` | At least one value, under stated conditions | A minimum without the accompanying assumptions |

These are documentation refinements. RxJS's `Observable<T>` type does not enforce them. In particular, `T?` here describes a **stream's emission count**. It does not mean a payload of `T | undefined`, an optional TypeScript property, or Haskell's `Maybe T`.

For a nonnegative integer count, the general `take` signature remains:

```text
take :: Count → T* → T*
```

For the specific configuration `take(1)`, an upper bound is useful:

```text
take(1) :: T* → T?
```

The result may emit nothing: its source can complete empty, fail, never emit, or be unsubscribed. This matches [`take`'s implementation](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/take.ts).

A seeded `reduce` emits exactly one accumulated value **if its source completes successfully, its reducer succeeds, and the result subscription stays active until delivery**. That conditional statement belongs beside the signature. Keep `S*` in the general type; do not silently turn it into `S!`. See [`reduce`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/reduce.ts) and [`scanInternals`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/scanInternals.ts).

## Parameter conventions

| Name | Convention used in this guide |
| --- | --- |
| `Count` | A nonnegative integer for the illustrated `take` and `skip` calls |
| `PositiveCount` | A positive integer for buffer and window sizes |
| `Duration` | A nonnegative interval in the scheduler's time units; milliseconds with the default `asyncScheduler` |
| `Index` | The callback's numeric index |
| `Scheduler` | The explicitly selected RxJS scheduler |

These names communicate intended inputs. They do not claim that the RxJS API uses branded count types or rejects every invalid number. The relevant parameter types in RxJS remain `number` and `SchedulerLike`.

## Add detail only where it matters

The teaching form of `map` uses a unary projection:

```text
map :: (T → R) → T* → R*
```

To show the actual callback's two supplied arguments:

```text
map :: ((T, Index) → R) → T* → R*
```

For a filter carrying a type-narrowing guarantee, define `Guard<T, R>` as a TypeScript type predicate from `T` to a subtype `R`:

```text
filter :: Guard<T, R> → T* → R*     where R is a subtype of T
```

An ordinary `T → Bool` predicate signature alone does not state that narrower output relationship. See the official [`map`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/map.ts) and [`filter`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/filter.ts) overloads.

To display the broader accepted input family for a flattening operator:

```text
switchMap :: (T → Input<R>) → T* → R*
```

`Input<R>` includes Observable, iterable, Promise-like, and other supported producer shapes. The Observable-only form `(T → R*) → T* → R*` is a deliberate specialization. Neither form states whether an underlying operation supports cancellation. The precise accepted union is [`ObservableInput`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/types.ts).

## A complete operator entry

Pair the compact type with a selected overload and a short explanation of what happens on new values. Include relevant rules for time, completion, error, cancellation, and sharing. Link the corresponding RxJS source for the full API.

This keeps the displayed signature small while giving the reader enough information to choose an operator correctly. Continue with the [operator catalog](/reference/operators) or the [TypeScript bridge](/guide/typescript).
