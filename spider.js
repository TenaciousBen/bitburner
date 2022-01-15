import * as lib from "lib.js";

/** @param {NS} ns **/
export async function main(ns) {
	const prune = !ns.args[0] || ns.args[0] === "true";
	const visualizeAsList = !ns.args[1] || ns.args[1] === "true";
	ns.tprint(`spidering with ${prune ? "pruned" : "unpruned"} result ${visualizeAsList ? "list" : "tree"}`);
	const hackingLevel = ns.getHackingLevel();
	const tree = lib.makeTree(ns, "home");
	const openablePorts = [
		ns.fileExists("BruteSSH.exe", "home"),
		ns.fileExists("FTPCrack.exe", "home"),
		ns.fileExists("RelaySMTP.exe", "home"),
		ns.fileExists("HTTPWorm.exe", "home"),
		ns.fileExists("SQLInject.exe", "home")
	].filter(x => !!x).length;
	const pruner = combinePredicates(
		t => t.server.requiredHackingSkill <= hackingLevel,
		t => !t.server.hasAdminRights,
		t => t.server.numOpenPortsRequired <= openablePorts
	);
	if (prune) lib.pruneTree(pruner, tree);
	if (visualizeAsList) {
		const asList = lib.flattenTree(tree);
		const matches = prune ? asList.filter(pruner) : asList;
		for (let item of matches) ns.tprint(item.host);
	}
	else visualizeTree(ns, tree);
}

/** @param {nodePredicate[]} funcs **/
export function combinePredicates(...funcs) {
	return (t) => {
		for (const func of funcs) if (!func(t)) return false;
		return true;
	}
}

/**
@param {NS} ns
@param {TreeItem} tree
**/
function visualizeTree(ns, tree, depth = 0) {
	let indent = "";
	for (let i = 0; i < depth; i++) indent += "\--";
	ns.tprint(`${indent} ${tree.host}`);
	ns.tprint(`${indent} skill: ${tree.server.requiredHackingSkill}`);
	ns.tprint(`${indent} root: ${tree.server.hasAdminRights}`);
	for (const child of tree.children) visualizeTree(ns, child, depth + 1);
}