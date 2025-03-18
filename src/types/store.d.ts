import { RootState } from '@/store';

export interface Action<T = never> {
  type: string;
  payload?: T;
  meta?: Record<string, string | number | boolean>;
  error?: boolean;
}

export interface ActionCreator<T = any> {
  (payload?: T): Action<T>;
  type: string;
}

export interface AsyncActionCreator<T = any, S = any, E = any> {
  request: ActionCreator<T>;
  success: ActionCreator<S>;
  failure: ActionCreator<E>;
  type: string;
}

export interface ThunkAction<R = void> {
  (dispatch: ThunkDispatch<RootState, unknown, Action>, getState: () => RootState): R;
}

export interface ThunkDispatch<S = RootState, E = unknown, A extends Action = Action> {
  <T extends A>(action: T): T;
  <R>(asyncAction: ThunkAction<R>): R;
}

export interface Selector<T> {
  (state: RootState): T;
}

export interface SliceState<T = never> {
  loading: boolean;
  error: string | null;
  data: T;
}

export interface SliceCaseReducers<T> {
  setLoading: (state: SliceState<T>, action: Action<boolean>) => void;
  setError: (state: SliceState<T>, action: Action<string | null>) => void;
  setData: (state: SliceState<T>, action: Action<T>) => void;
  reset: (state: SliceState<T>) => void;
}

export interface SliceExtraReducers<State extends SliceState> {
  [key: string]: (state: State, action: Action) => void;
}

export interface SliceOptions<State extends SliceState> {
  name: string;
  initialState: State;
  reducers: SliceCaseReducers<State>;
  extraReducers?: SliceExtraReducers<State>;
}

export interface Slice<State extends SliceState> {
  name: string;
  reducer: (state: State | undefined, action: Action) => State;
  actions: {
    setLoading: ActionCreator<boolean>;
    setError: ActionCreator<string | null>;
    setData: ActionCreator<unknown>;
    reset: ActionCreator<void>;
  };
  selectors: {
    selectLoading: Selector<boolean>;
    selectError: Selector<string | null>;
    selectData: Selector<unknown>;
  };
}

// Type-safe dispatch function
export type StoreDispatch = <T>(action: Action<T>) => void;

// Type-safe selector function
export type Selector<T> = (state: RootState) => T;

// Store subscription callback
export type StoreSubscription = () => void;

// Store middleware type
export type Middleware = (store: {
  getState: () => RootState;
  dispatch: StoreDispatch;
}) => (next: StoreDispatch) => (action: Action) => void; 