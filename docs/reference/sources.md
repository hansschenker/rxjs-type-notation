# Sources and scope

The compact notation is this project's proposal. The operator descriptions and executable examples use **RxJS 7.8.2** as their reference, so the source links below are pinned to that release. This is a selected operator guide, not an exhaustive replacement for the library's declarations.

## What is being proposed?

Haskell contributes the concise arrow style, right associativity, and the habit of reading a multi-stage function through its type. This guide introduces its own stream suffix, `T*`, and applies it to RxJS's existing configuration-then-source structure.

The notation deliberately distinguishes three views: the short teaching form, a more precise form when indices or narrowing matter, and the actual TypeScript API. Statements about timing, termination, cancellation, or sharing belong beside these types. See the [notation rules](/reference/notation).

## Haskell foundations

| Topic | Primary reference |
| --- | --- |
| Expressions, function application, and lambda abstractions | [Haskell 2010 Report, chapter 3](https://www.haskell.org/onlinereport/haskell2010/haskellch3.html) |
| Type syntax and function arrows | [Haskell 2010 Report, chapter 4](https://www.haskell.org/onlinereport/haskell2010/haskellch4.html) |
| Composition, application, currying, and uncurrying | [GHC's `Data.Function` documentation](https://downloads.haskell.org/ghc/9.0-latest/docs/libraries/base-4.15.1.0/Data-Function.html) |

## RxJS types and execution

| Topic | Primary reference |
| --- | --- |
| `OperatorFunction`, `MonoTypeOperatorFunction`, `ObservableInput` | [RxJS 7.8.2 `types.ts`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/types.ts) |
| Observable construction and subscription | [RxJS 7.8.2 `Observable.ts`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/Observable.ts) |
| Notifications and teardown | [RxJS Observable guide](https://rxjs.dev/guide/observable) and [Subscription guide](https://rxjs.dev/guide/subscription) |
| Schedulers and execution context | [RxJS Scheduler guide](https://rxjs.dev/guide/scheduler) |
| Sharing and replay | [`share.ts`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/share.ts) and [`shareReplay.ts`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/shareReplay.ts) |

## Operator source map

| Family | RxJS 7.8.2 source files |
| --- | --- |
| Transform and select | [`map`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/map.ts), [`filter`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/filter.ts), [`distinctUntilChanged`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/distinctUntilChanged.ts) |
| Bound the output | [`take`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/take.ts), [`skip`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/skip.ts), [`takeUntil`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/takeUntil.ts) |
| Remember state | [`scan`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/scan.ts), [`reduce`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/reduce.ts), [`scanInternals`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/scanInternals.ts) |
| Flatten inner flows | [`mergeMap`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/mergeMap.ts), [`concatMap`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/concatMap.ts), [`switchMap`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/switchMap.ts), [`exhaustMap`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/exhaustMap.ts) |
| Schedule delivery policies | [`debounceTime`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/debounceTime.ts), [`auditTime`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/auditTime.ts), [`sampleTime`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/sampleTime.ts), [`throttleTime`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/throttleTime.ts) |
| Collect or partition | [`bufferCount`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/bufferCount.ts), [`windowCount`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/windowCount.ts) |
| Combine values | [`combineLatestWith`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/combineLatestWith.ts), [`withLatestFrom`](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/withLatestFrom.ts) |

Each operator entry also links its own implementation. Deprecated overloads and optional configuration variations are included only when explicitly discussed.

## TypeScript and VitePress

| Topic | Primary reference |
| --- | --- |
| Generic callable types | [TypeScript generics handbook](https://www.typescriptlang.org/docs/handbook/2/generics.html) |
| Function types and argument grouping | [TypeScript functions handbook](https://www.typescriptlang.org/docs/handbook/2/functions.html) |
| `satisfies` checks | [TypeScript 4.9 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator) |
| Documentation build and base paths | [VitePress 1.6.4 deployment guide](https://vuejs.github.io/vitepress/v1/guide/deploy) |
| Theme extension | [VitePress 1.6.4 default theme extension](https://vuejs.github.io/vitepress/v1/guide/extending-default-theme) |

The installed dependency versions and reproducible installation are recorded in `package.json` and `package-lock.json`. The build checks internal documentation links, and the separate TypeScript check verifies the example files.
