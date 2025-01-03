import {getState, patchState, WritableStateSource} from '@ngrx/signals';
import {produce} from "immer";

/**
 * This function leverages Immer's `produce` to let you write mutable-looking
 * changes in the `updater` callback while actually creating a new, immutable
 * state object under the hood.
 * @param store
 * @param updater
 * @example
 * ```ts
 * patchStateWithImmer(store, (state) => {
 *   state.user.name = name;
 *   state.user.age = age;
 *});
 * ```
 */
export function patchStateWithImmer<State extends object>(store: WritableStateSource<State>, updater: (cloned: State) => void): void {

    const state: State = getState(store);

    const next = produce(state, (draft: State) => {
        updater(draft);
    })

    patchState(store, next);
}
