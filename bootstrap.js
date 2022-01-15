const REPOSITORY_MASTER = "https://raw.githubusercontent.com/TenaciousBen/bitburner/master/";

/** @param {NS} ns **/
export async function main(ns) {
	await fetch(ns, "hack.js");
	await fetch(ns, "lib.js");
	await fetch(ns, "main.js");
	await fetch(ns, "path.js");
	await fetch(ns, "sec.js");
	await fetch(ns, "spider.js");
	ns.exec("main.js", "home");
}

/** 
 * @param {NS} ns
 * @param {string} scriptNameWithExtension
 * @returns Promise<void>
 *  **/
async function fetch(ns, scriptNameWithExtension) {
	const url = REPOSITORY_MASTER + scriptNameWithExtension;
	const successful = await ns.wget(url, scriptNameWithExtension, "home");
	if (!successful) throw `Could not download script ${scriptNameWithExtension}`;
	ns.s
	ns.tprint(`${scriptNameWithExtension} downloaded to home`);
}