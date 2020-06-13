import simpleGit from "simple-git";
import sharp from "sharp";
import {notify} from "node-notifier";
import {createHash} from "crypto";
import {watch} from "chokidar";
import {head} from "superagent";
import {mkdirs, rename, writeFile} from "fs-extra";
import {write as writeToClipboard} from "clipboardy";
import {config as loadDotenv} from "dotenv";

loadDotenv();

const git = simpleGit("www");

function delay(ms: number) {
    return new Promise(yay => setTimeout(yay, ms));
}

async function importImage(path: string) {
    console.info("Pulling from origin");
    await git.pull("origin", "master");

    console.info("Creating image file");
    const image = sharp(path);
    const buffer = await image.webp().toBuffer();
    const hash = createHash("sha256").update(buffer).digest("hex").substring(0, 16);
    const fileName = `${hash}.webp`;

    console.info("Writing image");
    await mkdirs("www/f");
    await writeFile(`www/f/${fileName}`, buffer);

    // rename gitignore as this directory is ignored so git won't let us commit
    await rename(".gitignore", ".gitignore.tmp");
    console.info("Committing change");
    await git.add(`f/${fileName}`);
    await git.commit("add new image");
    await rename(".gitignore.tmp", ".gitignore");

    console.info("Pushing to remote");
    await git.push("origin", "master");

    const url = `${process.env.BASE_URL}f/${fileName}`;

    console.info("Waiting for file to be available");
    while (true) {
        console.debug("Ping");
        try {
            await head(url);
            break;
        } catch {
            await delay(500);
        }
    }

    await writeToClipboard(url);

    notify({
        title: "Screenshot uploaded",
        message: "URL copied to the clipboard"
    });
}

console.info("Waiting for files...");
watch(process.env.WATCH_GLOB, {
    ignoreInitial: true
}).on("add", async path => {
    console.log("Add", path);
    await importImage(path);
})
