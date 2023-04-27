import { gibUrls } from "./gibUrl.js";
import { readdir, writeFile } from "fs/promises";

const archiveFolder = "./archives";

(async () => {
	const archives = await readdir(archiveFolder);
	const superSet = new Set<string>();

	for (const archive of archives) {
		console.log("Processing archive: " + archive);
		const archiveSet = await gibUrls(`${archiveFolder}/${archive}`);
		console.log("\nMerging Sets...");
		for (const item of archiveSet) superSet.add(item);
	}

	const superArray = Array.from(superSet);

	console.log("Writing superSet!");
	await writeFile("./fimfarchive-urlSuperSet.json", JSON.stringify(superArray));

	console.log("Writing imgur superSet!");
	await writeFile("./fimfarchive-urlSuperSet-imgur.json", JSON.stringify(superArray.filter((s) => s.includes("imgur"))));
})();
