/** @interface **/
export function TreeItem() { }
/** @type {string} **/
TreeItem.host;
/** @type {TreeItem|null} **/
TreeItem.parent;
/** @type {Server} **/
TreeItem.server;
/** @type {TreeItem[]} **/
TreeItem.children;

/**
* @interface
* @param {TreeItem} node
**/
export function nodePredicate(node) { return true; }

/**
@param {nodePredicate} predicate
@param {TreeItem} node
@returns {TreeItem | null}
**/
export function findNode(predicate, node) {
	if (predicate(node)) return node;
	for (let child of node.children) {
		const match = findNode(predicate, child);
		if (match) return match;
	}
	return null;
}

/**
@param {TreeItem} node
@returns {TreeItem[]}
**/
export function pathTo(node, agg = []) {
	if (!node) return agg;
	agg = [node, ...agg];
	if (!node.parent) return agg;
	return pathTo(node.parent, agg);
}

/**
@param {nodePredicate} pruner
@param {TreeItem} node
@param {TreeItem} parent
prunes the tree, leaving only nodes which match the pruner predicate, or nodes which connect matching nodes to the root
**/
export function pruneTree(pruner, node) {
	if (!node) return;
	// prune kids
	for (let child of node.children) pruneTree(pruner, child, node);
	// if no parent, fuck off
	if (!node.parent) return;
	// if any kids are left, node is part of path
	if (node.children.length !== 0) return;
	// if no kids are left, check if node matches pred
	if (!pruner(node)) node.parent.children = node.parent.children.filter(p => p !== node);
}

/**
@param {NS} ns
@param {string} host
@param {TreeItem} tree
@param {TreeItem} parent
**/
export function makeTree(ns, host = "home", tree = null, parent = null) {
	if (treeIncludes(tree, host)) return;
	const server = ns.getServer(host);
	const node = {
		host,
		server,
		parent,
		children: []
	};
	if (!tree) tree = node;
	else parent.children.push(node);
	const nextServers = ns.scan(host);
	for (const server of nextServers) makeTree(ns, server, tree, node);
	return tree;
}

/**
@param {TreeItem} tree
@param {string} host
**/
export function treeIncludes(tree, host) {
	if (!tree) return false;
	if (tree.host === host) return true;
	for (const child of tree.children) {
		const match = treeIncludes(child, host);
		if (match) return true;
	}
	return false;
}

/**
@param {TreeItem} tree
**/
export function flattenTree(tree, collector = []) {
	if (!tree) return collector;
	collector.push(tree);
	for (let child of tree.children) flattenTree(child, collector);
	return collector;
}