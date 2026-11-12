import {
  concatMap,
  filter,
  map,
  of,
  scan,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs';
import type { Observable } from 'rxjs';
import type { Filter, Flatten, Map, Op, Scan } from './type-aliases';

// Verify the short views against the actual operator factories, retaining
// the original inferred types on the exported values.
export const checkedFactories = { map, filter, scan, switchMap } satisfies {
  map: Map;
  filter: Filter;
  scan: Scan;
  switchMap: Flatten;
};

// #region pipeline
const double = (value: number): number => value * 2;
const largeEnough = (value: number): boolean => value >= 4;
const label = (value: number): string => `Value ${value}`;

// A cold, synchronous source; each subscription processes 1, 2, 3.
export const labels$ = of(1, 2, 3).pipe(
  map(double),
  filter(largeEnough),
  map(label),
);

// An operator is a reusable transformation of a source description.
export const labelNumbers: Op<number, string> = source$ =>
  source$.pipe(map(label));
// #endregion pipeline

// #region narrowing
export type Message =
  | { kind: 'value'; value: number }
  | { kind: 'reset' };

export const isValue = (
  message: Message,
): message is Extract<Message, { kind: 'value' }> => message.kind === 'value';

export const valuesOnly = (messages$: Observable<Message>) => messages$.pipe(
  filter(isValue),
  map(message => message.value),
);
// #endregion narrowing

// #region state
export type Change =
  | { kind: 'add'; amount: number }
  | { kind: 'reset' };

const updateTotal = (state: number, change: Change): number =>
  change.kind === 'reset' ? 0 : state + change.amount;

export const rememberTotal = (changes$: Observable<Change>) => changes$.pipe(
  scan(updateTotal, 0),
  startWith(0),
  shareReplay({ bufferSize: 1, refCount: true }),
);
// #endregion state

// #region policies
export type Request = { id: string };
export type Reply = { id: string; text: string };

// The caller provides a producer with an explicit teardown contract.
export const onlyLatest = (
  requests$: Observable<Request>,
  run: (request: Request) => Observable<Reply>,
) => requests$.pipe(switchMap(run));

export const queueInOrder = (
  requests$: Observable<Request>,
  run: (request: Request) => Observable<Reply>,
) => requests$.pipe(concatMap(run));
// #endregion policies
