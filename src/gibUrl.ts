import { createReadStream, statSync } from "fs";

const chunkSize = 8000000; // 8MB

const allUrls = /https?:\/\/(?:www\.)?[\w-]+(\.[\w-]+)+([/?#][\w-./?%&=]*)?/g;

export const gibUrls = (filePath: string): Promise<Set<string>> => {
	return new Promise((resolve, reject) => {
		const fileStream = createReadStream(filePath);
		const urls = new Set<string>();
		let buffer = "";
		let bytesProcessed = 0;
		let totalBytes = statSync(filePath).size;
		let logInterval = 500; // Log progress every 5000ms (5 seconds)

		const int = setInterval(() => {
			const progress = (bytesProcessed / totalBytes) * 100;
			const bytesProcessedMB = (bytesProcessed / 1000000).toFixed(2);
			const totalBytesMB = (totalBytes / 1000000).toFixed(2);
			process.stdout.write(`\rProgress: ${bytesProcessedMB}MB/${totalBytesMB}MB (${progress.toFixed(2)}%)`);
		}, logInterval);

		fileStream.on("data", (chunk) => {
			buffer += chunk.toString("utf8");
			bytesProcessed += chunk.length;

			if (buffer.length >= chunkSize) processMatches();
		});

		fileStream.on("end", () => {
			processMatches(true);
			clearInterval(int);
			resolve(urls);
		});

		function processMatches(isEnd = false) {
			setImmediate(() => {
				let match;
				while ((match = allUrls.exec(buffer)) !== null) {
					urls.add(match[0]);
				}
				buffer = buffer.slice(allUrls.lastIndex);
				if (isEnd) {
					while ((match = allUrls.exec(buffer)) !== null) {
						urls.add(match[0]);
					}
				}
				if (buffer.length >= chunkSize) {
					buffer = "";
				}
			});
		}
	});
};
