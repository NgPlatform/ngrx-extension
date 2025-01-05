import { effect } from '@angular/core';
import { getState, patchState, signalStoreFeature, withHooks, withMethods } from '@ngrx/signals';

export const STATE_HISTORY = Symbol('STATE_HISTORY');

export type TStateHistory<State> = {
	stateVersions: State[];
	currentVersionIndex: number;
};

export type Config = {
	maxLength?: number;
	sync?: boolean;
};

// todo next　reference
// historiesChangeDetFn?: (
//   store: Prettify<StateSignals<Input['state']> & Input['props'] & Input['methods'] & WritableSignal<Input['state']>>,
//   histories: State[],
// ) => void;

export function withHistory<State extends object>({ maxLength = 100, sync = true }: Config) {
	/** このオブジェクトにstateの変更履歴を保存する */
	const stateHistory: { [STATE_HISTORY]: TStateHistory<State> } = {
		[STATE_HISTORY]: {
			stateVersions: [],
			currentVersionIndex: 0,
		},
	};

	/** この関数内でstateを書き換え場合trueとする */
	let dirty = false;

	return signalStoreFeature(
		withMethods((store) => ({
			/** この関数を呼び出すことでstateの変更履歴を一つ前に戻す */
			undo() {
				// currentVersionIndexが1の時は何もしない
				if (stateHistory[STATE_HISTORY].currentVersionIndex <= 1) {
					return;
				}

				// 現在のバージョンのインデックスを一つ前に戻す
				stateHistory[STATE_HISTORY].currentVersionIndex--;

				const { stateVersions, currentVersionIndex } = stateHistory[STATE_HISTORY];

				// ストアの更新
				dirty = true;

				patchState(store, stateVersions[currentVersionIndex - 1]);
			},

			/** この関数を呼び出すことでstateの変更履歴を一つ進める */
			redo() {
				// currentVersionIndexがstateVersionsの長さと同等なら最新なため何もしない
				if (stateHistory[STATE_HISTORY].currentVersionIndex >= stateHistory[STATE_HISTORY].stateVersions.length) {
					return;
				}

				stateHistory[STATE_HISTORY].currentVersionIndex++;

				const { stateVersions, currentVersionIndex } = stateHistory[STATE_HISTORY];

				// ストアの更新
				dirty = true;

				patchState(store, stateVersions[currentVersionIndex - 1]);
			},

			/** 履歴を削除する */
			clearHistories() {
				stateHistory[STATE_HISTORY].stateVersions = stateHistory[STATE_HISTORY].stateVersions.filter(
					(_, index) => index + 1 === stateHistory[STATE_HISTORY].currentVersionIndex,
				);
				stateHistory[STATE_HISTORY].currentVersionIndex = 1;
			},
		})),

		withHooks({
			onInit(store) {
				if (sync) {
					effect(() =>
						((state) => {
							//
							if (dirty) {
								dirty = false;
								return;
							}

							// バージョンの管理を行う。
							const { stateVersions, currentVersionIndex } = stateHistory[STATE_HISTORY];

							// currentVersionIndexが末尾でない場合は、currentVersionIndex以降の履歴を削除し新たに追加を行う
							if (stateVersions.length !== currentVersionIndex) {
								stateHistory[STATE_HISTORY].stateVersions.splice(currentVersionIndex, stateVersions.length - 1);
							}

							// 最大長を超えた場合は先頭を削除
							if (currentVersionIndex >= maxLength) {
								stateHistory[STATE_HISTORY].stateVersions.shift();
							}

							stateHistory[STATE_HISTORY].stateVersions.push(state as State);
							stateHistory[STATE_HISTORY].currentVersionIndex = stateHistory[STATE_HISTORY].stateVersions.length;
						})(getState(store)),
					);
				}
			},
		}),
	);
}
