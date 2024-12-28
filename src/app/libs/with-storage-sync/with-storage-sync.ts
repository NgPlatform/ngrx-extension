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
        const currentState = getState(store) as Record<string, unknown>;

        writeDfs(currentState, nodes, prefix, (key, fullKeyPath, objectState) => {

          // ストアにkeyがない場合
          if (!(objectState as Record<string, object>).hasOwnProperty(key)) {
            throw new Error(`[${key}] ${key} not found`);
          }

          // ストアにkeyはあるがundefinedの時
          // todo undefinedの時はエラーではなくreturnした方が良さそう
          if (typeof (objectState as Record<string, object>)[key] === 'undefined') {
            throw new Error(`state[${key}] type is undefined`);
          }

          const value: object = (objectState as Record<string, object>)[key];

          storage.setItem(fullKeyPath, JSON.stringify(value));
        })
      },

      // storageからデータを読み取りストアに保存
      readFromStorage(): void {

        readDfs(nodes, prefix, ((fullKeyPath) => {
          const jsonString: string | null = storage.getItem(fullKeyPath);

          console.log('item', JSON.parse(JSON.stringify(jsonString)));

          if (jsonString === null) {
            return
          }

          const slicedKeys: string[] = fullKeyPath.split('-').filter(x => x !== prefix);

          console.log('slicedKeys', JSON.parse(JSON.stringify(slicedKeys)));

          const recordState = createObject(jsonString, slicedKeys, slicedKeys.length - 1, {});

          console.log('recordState', JSON.parse(JSON.stringify(recordState)))

          patchState(store, ((prevState) => {
            return R.mergeDeep(prevState, recordState);
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
            // console.log('_state', _state);
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
 * @param currentState   現在のストアの状態オブジェクト
 * @param nodes   対象とするキー名またはネストしたキー構造
 * @param prefix    prefix や親ノードから連結されたキー文字列
 * @param callback キーが見つかった際に呼ばれるコールバック (key, fullKeyPath, objectState を引数に取る)
 */
function writeDfs(currentState: Record<string, unknown>, nodes: TNodeItem[], prefix: string, callback: (key: string, fullKeyPath: string, objectState: unknown) => void): void {
  nodes.forEach((node) => {
    if (typeof node === 'string') {

      const fullKeyPath = prefix === '' ? node : `${prefix}-${node}`;
      // 現在のnodeが末尾であればcallback関数を呼び出しストレージに取得したデータを書き込む
      callback(node, fullKeyPath, currentState);
    } else {
      for (const [key, childNode] of Object.entries(node)) {
        const nestedState = currentState[key] as Record<string, unknown>;
        const newPrefix = prefix === '' ? key : `${prefix}-${key}`;

        writeDfs(nestedState, childNode, newPrefix, callback);
      }
    }
  })
}


/**
 * Storage に保存してあるデータを読み込むため、prefix + ノード名を辿りながら
 * DFS (深さ優先探索) で探して、キー名が確定するたびにコールバックを呼び出す補助関数
 *
 * @param nodes    対象とするキー名またはネストしたキー構造
 * @param prefix     prefix や親ノードを連結したキー文字列
 * @param callback キーが見つかった際に呼ばれるコールバック (最終的なキーを引数に取る)
 */
function readDfs(nodes: TNodeItem[], prefix: string, callback: (fullKeyPath: string) => void): void {
  nodes.forEach((node) => {
    if (typeof node === 'string') {
      const fullPathKey = prefix === '' ? node : `${prefix}-${node}`
      callback(fullPathKey);
    } else {
      for (const [key, childNode] of Object.entries(node)) {
        const newPrefix = prefix === '' ? key : `${prefix}-${node}`;
        readDfs(childNode, newPrefix, callback);
      }
    }
  })
}

/**
 * Storage から取り出した JSON 文字列をパースし、元の状態ツリーの階層構造に
 * 合わせて再帰的にオブジェクトを作成するための補助関数
 *
 * @param jsonString    Storage に保存されていた JSON 文字列
 * @param nodesPath   prefix を除去したノード階層リスト (例: ['user', 'profile'])
 * @param nodesIdx 現在処理しているノードのインデックス (末尾から 0 へ向かって処理)
 * @param currentState   組み立て中の状態オブジェクト
 * @returns ノード階層を考慮して組み立てたオブジェクト
 */
function createObject(jsonString: string, nodesPath: string[], nodesIdx: number, currentState: Record<string, unknown>): Record<string, unknown> {

  console.log('createObject', nodesPath, nodesIdx);


  const recordState = {[nodesPath[nodesIdx]]: currentState}; // users:{}

  // 末尾の場合ストレージから取得したデータをパースして当てはめる
  if (nodesIdx === nodesPath.length - 1) {
    recordState[nodesPath[nodesIdx]] = JSON.parse(jsonString);
  }

  if (nodesIdx === 0) {
    return recordState;
  }

  return createObject(jsonString, nodesPath, nodesIdx - 1, recordState);
}
