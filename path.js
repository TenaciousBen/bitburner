import * as lib from "./lib.js";

/** @param {NS} ns **/
export async function main(ns) {
	const target = ns.args[0];
	if (!target) throw `expected string arg, got ${target}`;
	const tree = lib.makeTree(ns, "home");
	const node = lib.findNode((item) => item.host === target, tree);
	const path = lib.pathTo(node);
	if (path.length <= 1) {
		ns.tprint("No path to node, or you're already there");
		return;
	}
	for (let item of path.slice(1)) ns.tprint(`connect ${item.host}`);
}