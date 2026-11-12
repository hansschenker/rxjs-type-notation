# Operator reference

These 23 entries show how the notation reads across common RxJS 7.8.2 pipeable operators. Each signature describes a selected form, followed by the policy needed to understand its behavior. The notation does not replace the complete overload declarations.

Start with [why this notation](/guide/why-this-notation), [reading signatures](/guide/reading-signatures), and the [notation reference](/reference/notation). The [TypeScript guide](/guide/typescript) connects these descriptions to executable code.

## Scope and conventions

- `T*` means `Observable<T>`. It describes an Observable, without promising a particular timing, cardinality, or sharing policy.
- `T[]` means an array payload; `[T, U]` means a tuple payload. Parentheses group compound payloads before the stream suffix.
- `Count` means a nonnegative integer. `PositiveCount` means a positive integer. These are preconditions of the examples, not runtime validation supplied by TypeScript.
- The main signatures omit callback indices, deprecated overloads, and optional settings unless shown. Timing examples use nonnegative durations and `asyncScheduler`.
- An arrow denotes a function stage. Parenthesized argument groups preserve a single JavaScript call: `(A, B) → C` represents an operation called with both arguments together.

## Value transformation

| Operator | Selected signature | What happens on a source value |
| --- | --- | --- |
| `map` | `(T → R) → T* → R*` | Apply the projection and emit its result. |

The projection supplies the domain rule. The operator supplies the per-value processing pattern. If the projection returns an Observable, ordinary `map` emits that Observable as a value: the resulting shape is `(R*)*`. Flattening requires a separate policy.

The selected projection ignores the index. The more explicit callback shape is given under [precision notes](#precision-notes).

## Selection and lifetime

| Operator | Selected signature | Policy |
| --- | --- | --- |
| `filter` | `(T → Bool) → T* → T*` | Forward a value when the predicate is true. |
| `take` | `Count → T* → T*` | Forward at most the requested count, then complete and release upstream. |
| `skip` | `Count → T* → T*` | Discard the requested initial count, then forward subsequent values. |
| `takeUntil` | `U* → T* → T*` | Forward source values until the notifier emits its first value. |
| `distinctUntilChanged()` | `T* → T*` | Forward the first value, then values unequal to the last emitted value under the default `===` comparison. |

The `distinctUntilChanged()` row shows an already configured operator, using the no-argument factory call. Its optional comparator and key selector are omitted.

`take(0)` completes without subscribing to the source. `skip(0)` forwards source values normally.

For `takeUntil`, the notifier's **next** notification ends the output; completion of the notifier alone does not. A notifier error errors the output. The notifier is subscribed first, so a synchronous notifier value can prevent the source subscription entirely.

The `takeUntil` signature selects an Observable notifier. The actual API also accepts other `ObservableInput` forms.

## State and aggregation

Use a reducer that receives the state and current value together:

```text
Reducer S T ≔ (S, T) → S
```

| Operator | Selected seeded signature | Emission policy |
| --- | --- | --- |
| `scan` | `(Reducer S T, S) → T* → S*` | Update state and emit it for each source value. |
| `reduce` | `(Reducer S T, S) → T* → S*` | Update state, then emit the final state on successful source completion. |

These forms preserve the actual configuration grouping:

```ts
scan(update, initialState)(source$)
reduce(update, initialState)(source$)
```

A fully curried presentation can describe the same conceptual roles, but it would not be the literal JavaScript call shape. Neither the reducer nor the configuration arguments become curried automatically.

The identical type signatures do not capture the difference in output timing:

| Source | Seeded `scan` | Seeded `reduce` |
| --- | --- | --- |
| Completes without values | No value, then completion | Seed value, then completion |
| Emits values and completes successfully | Each updated state | Final state |
| Errors before completing | Earlier states may have been emitted; then error | Error without a final result |

`scan` does not emit its seed merely because a consumer subscribes. Add `startWith(initialState)` when the initial state should be visible immediately.

The selected overload uses the same type for the seed and accumulated state. Other overloads have different type relationships. Unseeded `reduce` on an empty source completes without a value; do not infer its behavior from `Array.prototype.reduce` or an unconditional “scan followed by last” equivalence.

## Time selection

All four selected forms have the shape:

```text
Duration → T* → T*
```

This profile uses the default `asyncScheduler`. The actual APIs allow a scheduler argument in the same configuration call, such as `debounceTime(duration, scheduler)`.

| Operator | Selection rule | Source completion with pending work |
| --- | --- | --- |
| `debounceTime` | Replace the pending value and move the silence deadline after each arrival. | Emit the pending value immediately, then complete. |
| `auditTime` | On an arrival while idle, start an interval; emit the latest value when it ends. | Wait for an active interval to end, emit, then complete. |
| `sampleTime` | At each periodic tick, emit the latest value received since the preceding sample, if any. | Complete without a final flush. |
| `throttleTime` | With default settings, emit the leading value and suppress arrivals during its interval. | Complete; this default profile has no trailing value. |

The `throttleTime` row fixes `{ leading: true, trailing: false }`. Changing that configuration changes the policy while leaving the payload type unchanged.

The clock comes from the scheduler; the operator defines how to use its scheduled events. A duration argument alone does not express completion flushing, cancellation, or ordering between events at the same time. See [types and behavior](/guide/behavior).

## Flattening policies

In the Observable-only learning profile, all four operators have the same signature:

```text
(T → R*) → T* → R*
```

| Operator | On an outer value | Active work |
| --- | --- | --- |
| `mergeMap` | Project and subscribe while capacity is available. | Allow overlap; default concurrency is unbounded. |
| `concatMap` | Queue the outer value if busy. | Process one inner at a time, in admission order. |
| `switchMap` | Unsubscribe the previous inner, then project and subscribe to the replacement. | Keep only the latest inner subscription. |
| `exhaustMap` | Ignore the outer value if busy. | Keep the current inner until it completes. |

For `concatMap`, projection of a queued value is deferred until processing capacity is available. For `exhaustMap`, projection is not called for an ignored value. Finite-concurrency `mergeMap` also queues outer values while capacity is exhausted.

Outer completion can leave inner work active. The output completes when its relevant inner work, and any admitted queue, has finished. An error or downstream unsubscription follows a different path.

The exact API accepts projections returning `ObservableInput<R>`, which includes more than Observables. Using the notation reference's alias, the expanded form is `(T → Input<R>) → T* → R*`. “Unsubscribe the previous inner” does not promise to abort every possible underlying operation; [cancellation has a precise boundary](/guide/behavior#completion-error-and-cancellation).

## Arrays and inner streams

The count-only profile uses positive counts and the default interval between openings.

| Operator | Selected signature | Output payload |
| --- | --- | --- |
| `bufferCount` | `PositiveCount → T* → (T[])*` | An array containing collected values. |
| `windowCount` | `PositiveCount → T* → (T*)*` | A live inner Observable receiving routed values. |

`bufferCount` emits full buffers and flushes an active partial buffer on successful source completion. A source error discards in-progress buffered arrays.

`windowCount` emits an initial window before receiving source values. It can open another window immediately after a count boundary, even when no later source value arrives. For a source containing `1, 2, 3, 4` and size `2`, consumers connected to each window as it is emitted can therefore observe windows containing `[1, 2]`, `[3, 4]`, and `[]`. `bufferCount(2)` produces only the first two arrays.

Inner windows are live. A late subscription can miss values already routed through a window. The nested type distinguishes payload shapes; it does not encode these subscription and lifecycle differences.

## Combining streams

For one additional Observable, these operators share a selected type:

```text
U* → T* → [T, U]*
```

| Operator | When it emits | How values are paired |
| --- | --- | --- |
| `combineLatestWith` | Either input emits, after both have supplied a value. | Latest value from each input. |
| `withLatestFrom` | The primary source emits, after the other input has supplied a value. | Current primary value with the other's latest value. |
| `zipWith` | A corresponding queued value is available from both inputs. | First with first, second with second, and so on. |

The tuple order follows the primary source, then the supplied input. The signatures do not reveal the trigger or buffering rule. The actual APIs accept additional inputs and broader `ObservableInput` forms; this table selects the two-input case.

## Sharing and replay

| Operator | Selected configured signature | Connection policy |
| --- | --- | --- |
| `share` | `ShareConfig<T> → T* → T*` | Share an upstream connection using the selected connector and reset rules. |
| `shareReplay` | `ShareReplayConfig → T* → T*` | Share and replay buffered values using an explicit reference-count policy. |

`share({})` uses a `Subject` and defaults to resetting on error, completion, and reference count reaching zero. This is a configuration profile, not an identity transformation.

`shareReplay(1)` defaults to `refCount: false`. For state shared only while consumers remain, choose the configuration explicitly:

```ts
shareReplay({ bufferSize: 1, refCount: true })
```

This releases an incomplete upstream connection when the last consumer leaves. A successfully completed replay remains cached. Read the [state and sharing example](/guide/behavior#state-and-sharing) before relying on reconnection behavior.

## Precision notes

### Indexed projection

The fuller projection accepted by `map` includes a zero-based index:

```text
map :: ((T, Index) → R) → T* → R*
```

This shows one callback receiving two arguments. It does not describe a callback called as `project(value)(index)`.

### Type refinement

The Boolean predicate profile preserves `T`. A TypeScript type guard can narrow it:

```text
filter :: Guard<T, U> → T* → U*    where U is a subtype of T
```

Here `Guard<T, U>` means a predicate that carries the type-level claim that an accepted `T` is a `U`. A plain `T → Bool` does not carry that narrowing claim.

### Limits of the shorthand

Observable input types, callback indices, seeds of different types, scheduler choices, and overload relationships can be restored when relevant. Treat the short signature as a documented profile. Identical arrow shapes do not establish equivalent traces, identical resource lifetimes, or monad laws.

## Sources

All implementation links are pinned to RxJS 7.8.2.

- [Type definitions](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/types.ts), [map](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/map.ts), [filter](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/filter.ts), [take](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/take.ts), [skip](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/skip.ts), [takeUntil](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/takeUntil.ts).
- [distinctUntilChanged](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/distinctUntilChanged.ts).
- [scan](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/scan.ts), [reduce](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/reduce.ts), and their [shared accumulation implementation](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/scanInternals.ts).
- [debounceTime](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/debounceTime.ts), [audit](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/audit.ts), [sample](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/sample.ts), [throttleTime](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/throttleTime.ts).
- [merge internals](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/mergeInternals.ts), [switchMap](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/switchMap.ts), [exhaustMap](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/exhaustMap.ts).
- [bufferCount](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/bufferCount.ts), [windowCount](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/windowCount.ts).
- [combineLatestWith](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/combineLatestWith.ts), [withLatestFrom](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/withLatestFrom.ts), [zipWith](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/zipWith.ts).
- [share](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/share.ts), [shareReplay](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/shareReplay.ts).

