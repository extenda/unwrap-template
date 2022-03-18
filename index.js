const { render } = require("ejs");
const {
  mkdir,
  readdir,
  readFile,
  writeFile,
  stat,
} = require("node:fs/promises");
const { dirname, join } = require("node:path");

unwrapTemplate();

async function unwrapTemplate() {
  const rootDir = "/data";
  const templateDir = join(rootDir, ".template");
  const templateFilesDir = join(templateDir, "files");
  const optionsFile = join(templateDir, "options.json");
  const outputPath = rootDir;

  const { gid, uid } = await stat(rootDir);
  process.setgid(gid);
  process.setuid(uid);

  const options = JSON.parse(
    await readFile(optionsFile, { encoding: "utf-8" })
  );

  await copyAndTransform(templateFilesDir, outputPath, options);
}

/**
 *
 * @param {string} inputDir
 * @param {string} outputDir
 * @param {Record<string, unknown>} options
 */
async function copyAndTransform(inputDir, outputDir, options) {
  for await (const fileName of listFileNames(inputDir)) {
    const templateFile = join(inputDir, fileName);
    const outputFile = join(outputDir, fileName);

    const fileContent = await readFile(templateFile, { encoding: "utf-8" });
    const transformedContent = render(fileContent, options);

    try {
      await mkdir(dirname(outputFile), { recursive: true });
    } catch (ignored) {}

    await writeFile(outputFile, transformedContent);
  }
}

/**
 * @param {string} absoluteDir
 * @param {string?} relativeDir
 * @returns {AsyncGenerator<string>}
 */
async function* listFileNames(absoluteDir, relativeDir = "") {
  const dirents = await readdir(absoluteDir, { withFileTypes: true });
  for (const dirent of dirents) {
    const direntName = dirent.name;
    if (dirent.isDirectory()) {
      yield* listFileNames(
        join(absoluteDir, direntName),
        join(relativeDir, direntName)
      );
    } else {
      yield join(relativeDir, direntName);
    }
  }
}
