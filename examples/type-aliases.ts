import type { Observable, ObservableInput } from 'rxjs';

// #region aliases
export type O<T> = Observable<T>;
export type Fn<A, B> = (value: A) => B;
export type Op<T, R = T> = Fn<O<T>, O<R>>;
export type Pred<T> = Fn<T, boolean>;
export type Reducer<S, T> = (state: S, value: T) => S;

// Selected, unary-callback views of operator factories.
// These do not reproduce every RxJS overload.
export type Map = <T, R>(project: Fn<T, R>) => Op<T, R>;
export type Filter = <T>(predicate: Pred<T>) => Op<T>;
export type Scan = <T, S>(reducer: Reducer<S, T>, seed: S) => Op<T, S>;
export type Flatten = <T, R>(project: Fn<T, O<R>>) => Op<T, R>;
// #endregion aliases

// #region precision
export type IndexedFn<T, R> = (value: T, index: number) => R;
export type Guard<T, R extends T> = (value: T) => value is R;
export type Input<R> = ObservableInput<R>;
export type FlattenInput = <T, R>(project: Fn<T, Input<R>>) => Op<T, R>;
// #endregion precision
