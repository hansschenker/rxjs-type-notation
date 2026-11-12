# Types and behavior

A compact signature explains which values and functions connect. A behavior description explains what a connected execution does over time.

After configuration, `take`, `skip`, `debounceTime`, and `share` can all have the shape `T* → T*`. Their input and output payload types agree, but they make different decisions about delivery, timing, termination, and connection lifetime. The [operator reference](/reference/operators) keeps those decisions beside the types.

## Describe a policy beside the signature

Use the fields needed for the operator under discussion:

| Dimension | Question |
| --- | --- |
| Source | Which inputs are observed, and when are their subscriptions established? |
| Trigger | Which event can cause an output? |
| Value | Which value is transformed, retained, selected, or discarded? |
| Cardinality | How many outputs are possible, under which assumptions? |
| Time | Which clock, scheduler, deadline, or interval matters? |
| Concurrency | Which inner executions overlap, queue, or get ignored? |
| Cancellation | Which managed subscriptions and tasks are released? |
| Termination | How do completion and errors affect pending work? |
| Sharing | Which consumers use the same source connection or replay state? |

State supports these policies: a counter, latest value, queue, or accumulator records what the next decision needs. Keep Time and Termination separate. A silence deadline and a completion flush are different rules.

For example, the selected `debounceTime` type is `Duration → T* → T*`. Its policy says that a source value replaces the pending value and moves the silence deadline; the deadline permits output; successful source completion flushes immediately; error or downstream unsubscription discards pending output. The arrow alone states none of those rules. See the [7.8.2 implementation](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/debounceTime.ts).

## Time comes from sources and schedulers

An Observable can emit synchronously during subscription. It can also deliver values later, following events from an external producer or work arranged through a scheduler. `T*` does not choose between these possibilities.

A timing operator uses its configured scheduler's clock and scheduling operations. Its duration specifies a policy parameter; it does not create an independent clock. The common time operators use `asyncScheduler` by default, while a different scheduler can change the execution context and time model.

Events with the same timestamp can still have an order. If a source value and a timer are both ready at a boundary, their actual scheduling order can affect what a stateful operator emits. A type signature and a duration do not specify that tie-breaking rule.

See [debounceTime](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/debounceTime.ts), [sampleTime](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/sampleTime.ts), and [asyncScheduler](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/scheduler/async.ts).

## Completion, error, and cancellation

These events have distinct meanings.

**Completion** is a terminal notification to the consumer. Operators can perform specified work before forwarding it: seeded `reduce` emits its final accumulator, while `debounceTime` flushes its pending value.

**Error** is a different terminal notification. Pending results are not automatically flushed. A projection or reducer that throws can also cause the output to error; JavaScript function types do not require those functions to be pure or exception-free.

**Unsubscription** closes a subscription and runs its teardown. It does not send a synthetic `complete` notification to that consumer. It releases the subscriptions and scheduled tasks owned by that execution, according to the implementation.

“Cancel the previous inner” therefore means closing its subscription. Actual physical work stops only if the producer's teardown supports stopping it. Closing delivery from a Promise-like input does not cancel the Promise's underlying operation. Sharing can also keep an upstream connection alive while another consumer still uses it.

With `takeUntil`, a notifier value completes the output and releases upstream. A notifier that only completes does not stop the source. These rules are visible in [takeUntil](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/takeUntil.ts); the distinction between notifications and closure is implemented by [Subscriber](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/Subscriber.ts) and [Subscription](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/Subscription.ts).

## On-demand, live, and shared sources

An Observable describes how a consumer connects to notifications. The execution it connects to may be created for that consumer, or it may already exist.

For a cold, on-demand source, each subscription starts an independent execution. For a live source such as a Subject connected to an existing producer, that producer can already be active before a new consumer subscribes. Composing an operator pipeline does not itself subscribe to that pipeline, but arbitrary JavaScript used to construct its inputs may already have performed work.

Sharing makes a particular connection policy explicit. Consumers of the same shared result can use one upstream connection. It does not make every Observable in a program shared, and applying `share` separately creates separate groups. See [Observable](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/Observable.ts), [Subject](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/Subject.ts), and [share](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/share.ts).

## State and sharing

A state stream commonly combines accumulation, an initial visible value, and an explicit replay policy:

```ts
import { scan, shareReplay, startWith } from 'rxjs';
import type { Observable } from 'rxjs';

type Action =
  | { type: 'increment' }
  | { type: 'reset' };

type Model = { readonly count: number };

const initialModel: Model = { count: 0 };

const update = (model: Model, action: Action): Model =>
  action.type === 'reset'
    ? initialModel
    : { count: model.count + 1 };

const createModel$ = (actions$: Observable<Action>) =>
  actions$.pipe(
    scan(update, initialModel),
    startWith(initialModel),
    shareReplay({ bufferSize: 1, refCount: true })
  );
```

Each stage has a separate responsibility. `scan` remembers and emits updated state. `startWith` makes the initial model visible when this chain connects. `shareReplay` shares the accumulation and replays the latest model to later consumers.

Create this result once and reuse it to share the same accumulation. Calling `createModel$` separately creates separate groups.

With this configuration, the first consumer sees the initial state, and active consumers then share the updates. If the last consumer leaves before the source terminates, the upstream connection and replay state reset. A later consumer starts the chain again from the initial model. A live action source does not replay actions missed during the disconnected period unless that source has its own replay policy.

Successful completion is different: `shareReplay` retains its completed replay, so later consumers receive the cached final model and completion. Errors reset the shared state for a future subscription. The defaults of `shareReplay(1)` differ because its reference counting is disabled.

These details follow from [scan](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/scan.ts), [startWith](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/startWith.ts), and [shareReplay](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/shareReplay.ts).

## Cardinality and algebra need their assumptions

“Seeded `reduce` produces one value” requires successful source completion and an active consumer. A source that never completes, errors, or is disconnected can prevent that result. The structural output remains `S*`; a stronger cardinality claim belongs in the policy with its assumptions.

Similarly, the shared flattening shape `(T → R*) → T* → R*` establishes compatible types, not identical behavior or monad laws. Cancellation, ordering, errors, and projection effects matter when comparing compositions.

Use the [notation reference](/reference/notation) for the symbols, [reading signatures](/guide/reading-signatures) for argument stages, and the [TypeScript guide](/guide/typescript) for compiler-facing types. Behavioral claims need traces, tests, or a stated semantic model in addition to an arrow.

