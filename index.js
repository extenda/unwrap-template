const { render } = require("ejs");
const {
  mkdir,
  readdir,
  readFile,
  writeFile,
  stat,
  cp,
  symlink,
} = require("node:fs/promises");
const { dirname, join } = require("node:path");

const SELF_ROOT_DIR = "/app";
const DATA_ROOT_DIR = "/data";

main();

async function main() {
  await executeAsUser();

  if (process.env.INIT === "true") {
    return initTemplateRepository();
  }

  await unwrapTemplate();
}

async function initTemplateRepository() {
  const metaDir = join(SELF_ROOT_DIR, "meta");

  await copyFiles(metaDir, DATA_ROOT_DIR);
  try {
    await symlink(
      join(process.env.DIR, ".template", "README.md"),
      join(DATA_ROOT_DIR, "README.md")
    );
  } catch (ignored) {}
}

async function unwrapTemplate() {
  const templateDir = join(DATA_ROOT_DIR, ".template");
  const templateFilesDir = join(templateDir, "files");
  const optionsFile = join(templateDir, "options.json");
  const outputPath = DATA_ROOT_DIR;

  const options = JSON.parse(
    await readFile(optionsFile, { encoding: "utf-8" })
  );

  await copyAndTransform(templateFilesDir, outputPath, options);
}

/**
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
 * @param {string} inputDir
 * @param {string} outputDir
 */
async function copyFiles(inputDir, outputDir) {
  for await (const fileName of listFileNames(inputDir)) {
    const inputFile = join(inputDir, fileName);
    const outputFile = join(outputDir, fileName);

    try {
      await mkdir(dirname(outputFile), { recursive: true });
    } catch (ignored) {}

    await cp(inputFile, outputFile);
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

async function executeAsUser() {
  const { gid, uid } = await stat(DATA_ROOT_DIR);
  process.setgid(gid);
  process.setuid(uid);
}
