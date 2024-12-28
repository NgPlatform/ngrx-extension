import {
  EmptyFeatureResult,
  getState,
  patchState,
  SignalStoreFeature,
  signalStoreFeature,
  withHooks,
  withMethods
} from '@ngrx/signals';
import {effect} from '@angular/core';
import * as R from 'remeda';

export type TConfig = {
  sync: boolean,
}

type TNodeItem = string | { [key in string]: TNodeItem[] };

/**
 * ストアの状態を Storage（localStorage / sessionStorage など）に保存・読み込みし、
 * 状態の変更と同期できるようにするための拡張機能
 *
 * @param storage 同期先となる Storage オブジェクト（localStorage, sessionStorage など）
 * @param nodes   同期対象となる状態のキーまたは階層構造（例: ['user', { settings: ['theme', 'language'] }]）
 * @param prefix  Storage に保存する際のキーの先頭に付与する文字列
 * @param config  オプション設定（sync: true の場合、状態変更時に自動でストレージに書き込む）
 * @returns NgRx Signals のストアに拡張機能を追加するためのオブジェクト
 */
export function withStorageSync(storage: Storage, nodes: TNodeItem[], prefix: string, config: Partial<TConfig>): SignalStoreFeature<EmptyFeatureResult, {
  state: {},
  props: {},
  methods: { writeToStorage: () => void, readFromStorage: () => void }
}> {

  return signalStoreFeature(
    withMethods((store) => ({

      // storageにストアのデータを書き込む
      writeToStorage(): void {
        const state = getState(store) as Record<string, unknown>

        wDfs(state, nodes, prefix, (key, keys, state) => {

          // ストアにkeyがない場合
          if (!(state as Record<string, object>).hasOwnProperty(key)) {
            throw new Error(`[${key}] ${key} not found`);
          }

          // ストアにkeyはあるがundefinedの時
          // todo undefinedの時はエラーではなくreturnした方が良さそう
          if (typeof (state as Record<string, object>)[key] === 'undefined') {
            throw new Error(`state[${key}] type is undefined`);
          }

          storage.setItem(keys, JSON.stringify((state as Record<string, object>)[key]));
        })
      },

      // storageからデータを読み取りストアに保存
      readFromStorage(): void {

        rDfs(nodes, prefix, ((keys) => {
          const item: string | null = storage.getItem(keys);

          if (item === null) {
            return
          }

          const nodes = keys.split('-').filter(x => x !== prefix);

          const recordState = createObject(item, nodes, nodes.length, {});

          patchState(store, ((state) => {
            return R.mergeDeep(state, recordState);
          }))
        }))

      }


    })),

    withHooks({
      onInit(store) {

        store.readFromStorage();

        // 自動同期が有効ならストアの状態を検知して自動でストレージに書き込む。
        if (config.sync) {
          effect(() => ((_state) => {
            store.writeToStorage()
          })(getState(store)))

        }
      },
    })
  )
}

/**
 * ストアの状態を深さ優先探索 (DFS) で巡回し、対象のキーやノードが見つかるたびに
 * コールバックを呼び出すための補助関数です。
 *
 * @param state   現在のストアの状態オブジェクト
 * @param nodes   対象とするキー名またはネストしたキー構造
 * @param keys    prefix や親ノードから連結されたキー文字列
 * @param callback キーが見つかった際に呼ばれるコールバック (key, keys, state を引数に取る)
 */
function wDfs(state: Record<string, unknown>, nodes: TNodeItem[], keys: string, callback: (key: string, keys: string, state: unknown) => void): void {
  nodes.forEach((node) => {
    if (typeof node === 'string') {
      // 現在のnodeが末尾であればcallback関数を呼び出しストレージに取得したデータを書き込む
      callback(node, keys === '' ? node : `${keys}-${node}`, state);
    } else {
      for (const [key, childNode] of Object.entries(node)) {
        wDfs(state[key] as Record<string, unknown>, childNode, keys === '' ? key : `${keys}-${key}`, callback);
      }
    }
  })
}


/**
 * Storage に保存してあるデータを読み込むため、prefix + ノード名を辿りながら
 * DFS (深さ優先探索) で探して、キー名が確定するたびにコールバックを呼び出す補助関数
 *
 * @param nodes    対象とするキー名またはネストしたキー構造
 * @param keys     prefix や親ノードを連結したキー文字列
 * @param callback キーが見つかった際に呼ばれるコールバック (最終的なキーを引数に取る)
 */
function rDfs(nodes: TNodeItem[], keys: string, callback: (keys: string) => void): void {
  nodes.forEach((node) => {
    if (typeof node === 'string') {
      callback(keys === '' ? node : `${keys}-${node}`);
    } else {
      for (const [key, childNode] of Object.entries(node)) {
        rDfs(childNode, keys === '' ? key : `${keys}-${node}`, callback);
      }
    }
  })
}

/**
 * Storage から取り出した JSON 文字列をパースし、元の状態ツリーの階層構造に
 * 合わせて再帰的にオブジェクトを作成するための補助関数
 *
 * @param item    Storage に保存されていた JSON 文字列
 * @param nodes   prefix を除去したノード階層リスト (例: ['user', 'profile'])
 * @param nodesIdx 現在処理しているノードのインデックス (末尾から 0 へ向かって処理)
 * @param state   組み立て中の状態オブジェクト
 * @returns       ノード階層を考慮して組み立てたオブジェクト
 */
function createObject(item: string, nodes: string[], nodesIdx: number, state: Record<string, unknown>): Record<string, unknown> {

  if (nodesIdx === 0) {
    return {
      [nodes[nodesIdx]]: state,
    }
  }

  const recordState = {[nodes[nodesIdx]]: state};

  // 末尾の場合ストレージから取得したデータをパースして当てはめる
  if (nodesIdx === nodes.length - 1) {
    recordState[nodes[nodesIdx]] = JSON.parse(item);
  }

  nodesIdx -= 1;
  return createObject(item, nodes, nodesIdx, recordState);
}
