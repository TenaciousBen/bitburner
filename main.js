import * as lib from "./lib.js";

const HACK_RAM = 2;
const SEC_RAM = 1.75;

/** @param {NS} ns **/
export async function main(ns) {
	const rehack = !!ns.args[0];
	ns.tprint(`${rehack ? "will" : "will not"} rehack - ${ns.args[0]} of type ${typeof (ns.args[0])} passed`);
	const oneSecond = 1000;
	const oneMinute = 60 * oneSecond;
	const shouldLoop = !rehack;
	do {
		const openablePorts = [
			ns.fileExists("BruteSSH.exe", "home"),
			ns.fileExists("FTPCrack.exe", "home"),
			ns.fileExists("RelaySMTP.exe", "home"),
			ns.fileExists("HTTPWorm.exe", "home"),
			ns.fileExists("SQLInject.exe", "home")
		].filter(x => !!x).length;
		const hackingLevel = ns.getHackingLevel();
		const hackableServers = getHackableServers(ns, hackingLevel, openablePorts, rehack);
		// print to logs rather than console to avoid this script being excessively chatty
		if (!hackableServers.length) ns.print(`no new hackable servers since last run - openable ports: ${openablePorts} - skill: ${hackingLevel}`);
		for (const server of hackableServers.filter(s => s.host !== "home")) await hackServer(ns, server.server);
		if (shouldLoop) await ns.sleep(oneMinute);
	} while (shouldLoop)
}

/**
* @param {NS} ns
* @param {number} hackingLevel
* @param {number} openablePorts
* @param {boolean} rehack
* **/
function getHackableServers(ns, hackingLevel, openablePorts, rehack) {
	const tree = lib.makeTree(ns, "home");
	const pruner = combinePredicates(
		// only get servers we have the skill to hack
		t => t.server.requiredHackingSkill <= hackingLevel,
		// only get servers we haven't already hacked
		t => rehack || !t.server.hasAdminRights,
		// only get servers whose ports we can open
		t => t.server.numOpenPortsRequired <= openablePorts
	);
	lib.pruneTree(pruner, tree);
	return lib.flattenTree(tree).filter(pruner);
}

/** @param {nodePredicate[]} funcs **/
function combinePredicates(...funcs) {
	return (t) => {
		for (const func of funcs) if (!func(t)) return false;
		return true;
	}
}

/**
* @param {NS} ns
* @param {Server} server
* @returns Promise
* **/
async function hackServer(ns, server) {
	const target = server.hostname;
	ns.tprint(`hacking ${target}`);
	const totalScriptRam = HACK_RAM + SEC_RAM;
	const freeRam = server.maxRam;
	ns.tprint("opening server");
	openServer(ns, target);
	ns.tprint("airdropping");
	await ns.scp(["hack.js", "sec.js"], "home", target);
	const threads = Math.floor(freeRam / totalScriptRam);
	const remainingRam = freeRam - (threads * totalScriptRam);
	const secThreads = Math.floor(remainingRam / SEC_RAM);
	if (threads === 0) {
		ns.tprint("Server has no RAM");
		return;
	}
	ns.tprint("killing existing scripts");
	ns.killall(target);
	ns.tprint(`running hack.js on ${target} with ${threads} threads`);
	if (!ns.exec("hack.js", target, threads, target, false, 10)) {
		ns.tprint("couldn't run hack.js");
		return;
	}
	ns.tprint(`running sec.js on ${target} with ${threads + secThreads} threads`);
	if (!ns.exec("sec.js", target, threads + secThreads, target)) ns.tprint("couldn't run sec.js");
}

/**
* @param {NS} ns
* @param {string} target
* **/
function openServer(ns, target) {
	if (ns.fileExists("BruteSSH.exe", "home")) ns.brutessh(target);
	if (ns.fileExists("FTPCrack.exe", "home")) ns.ftpcrack(target);
	if (ns.fileExists("RelaySMTP.exe", "home")) ns.relaysmtp(target);
	if (ns.fileExists("HTTPWorm.exe", "home")) ns.httpworm(target);
	if (ns.fileExists("SQLInject.exe", "home")) ns.sqlinject(target);
	ns.nuke(target);
}