export type TNodeItem = string | { [key: string]: TNodeItem[] };

/**
 * A helper function that traverses the store state in a Depth-First Search (DFS) manner,
 * calling a callback whenever a target key or node is found.
 *
 * @param currentState The current store state object.
 * @param nodes        The keys or nested node structures to traverse.
 * @param prefix       A combined prefix string from parent nodes, etc.
 * @param callback     A callback to be invoked when a key is found (taking key, fullKeyPath, objectState).
 */
export function traverseAndWrite(
	currentState: Record<string, unknown>,
	nodes: TNodeItem[],
	prefix: string,
	callback: (key: string, fullKeyPath: string, objectState: unknown) => void,
): void {
	for (const node of nodes) {
		if (typeof node === 'string') {
			const fullKeyPath = prefix === '' ? node : `${prefix}-${node}`;
			// If the current node is the end, call the callback to write data to storage
			callback(node, fullKeyPath, currentState);
		} else {
			for (const [key, childNode] of Object.entries(node)) {
				const nestedState = currentState[key] as Record<string, unknown>;
				const newPrefix = prefix === '' ? key : `${prefix}-${key}`;

				traverseAndWrite(nestedState, childNode, newPrefix, callback);
			}
		}
	}
}

/**
 * A helper function that loads data from Storage by traversing prefix + node names in a
 * DFS manner. Each time a key is determined, the callback is called.
 *
 * @param nodes    The keys or nested structures to search for in DFS.
 * @param prefix   A combined prefix string from parent nodes, etc.
 * @param callback A callback that receives the final key (fullKeyPath).
 */
export function traverseAndRead(
	nodes: TNodeItem[],
	prefix: string,
	callback: (fullKeyPath: string) => void,
): void {
	for (const node of nodes) {
		if (typeof node === 'string') {
			const fullPathKey = prefix === '' ? node : `${prefix}-${node}`;
			callback(fullPathKey);
		} else {
			for (const [key, childNode] of Object.entries(node)) {
				const newPrefix = prefix === '' ? key : `${prefix}-${node}`;
				traverseAndRead(childNode, newPrefix, callback);
			}
		}
	}
}

/**
 * A helper function that parses a JSON string retrieved from Storage and recursively builds
 * an object matching the original state tree hierarchy.
 *
 * @param jsonString  The JSON string retrieved from Storage.
 * @param nodesPath   A list of node keys after removing the prefix (e.g., ['user', 'profile']).
 * @param nodesIdx    The current node index being processed (moving from the last element to 0).
 * @param currentState The state object currently being assembled.
 * @returns The object constructed according to the node hierarchy.
 */
export function buildNestedState(
	jsonString: string,
	nodesPath: string[],
	nodesIdx: number,
	currentState: Record<string, unknown>,
): Record<string, unknown> {
	const recordState = { [nodesPath[nodesIdx]]: currentState }; // e.g. users: {}

	// If we're at the last element, parse the data from storage and assign it
	if (nodesIdx === nodesPath.length - 1) {
		recordState[nodesPath[nodesIdx]] = JSON.parse(jsonString);
	}

	if (nodesIdx === 0) {
		return recordState;
	}

	return buildNestedState(jsonString, nodesPath, nodesIdx - 1, recordState);
}
