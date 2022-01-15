/** @param {NS} ns **/
export async function main(ns) {
	const target = ns.args[0];
	const shouldWeaken = typeof (ns.args[1]) === "boolean" && ns.args[1];
	while (true) {
		let lastGrownBy = Number.MAX_SAFE_INTEGER;
		let growthCount = 0;
		while (lastGrownBy > 1) {
			if (shouldWeaken || growthCount % 2 === 0) await ns.weaken(target);
			lastGrownBy = await ns.grow(target);
			growthCount += 1;
		}
		if (shouldWeaken) await ns.weaken(target);
		await ns.hack(target);
	}
}