const assert = require("node:assert");
const { readFile, rm } = require("node:fs/promises");
const { chdir } = require("node:process");

const exec = require("node:util").promisify(require("node:child_process").exec);

testTemplateUnwrapping();

async function testTemplateUnwrapping() {
  try {
    chdir("test");
    await exec("bash .template/init.sh");

    const content = await readFile("hello.txt", { encoding: "utf-8" });

    assert.equal(content, "Hello World!\n");
  } finally {
    await rm("hello.txt");
  }
}
