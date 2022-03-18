const assert = require("node:assert");
const { mkdir, readFile, rm, lstat } = require("node:fs/promises");
const { chdir } = require("node:process");

const exec = require("node:util").promisify(require("node:child_process").exec);

const IMAGE_NAME = "extenda/unwrap-template";

testSuite(
  async function testTemplateUnwrapping() {
    try {
      await exec(`docker build . -t ${IMAGE_NAME}`);

      chdir("test");
      await exec("bash .template/init.sh");

      const content = await readFile("hello.txt", { encoding: "utf-8" });

      assert.equal(content, "Hello World!\n");
    } finally {
      await rm("hello.txt");
      chdir("..");
    }
  }

  // async function testTemplateRepoInit() {
  //   try {
  //     await exec(`docker build . -t ${IMAGE_NAME}`);

  //     await mkdir("test/meta-test");
  //     chdir("test/meta-test");

  //     await exec(`docker run -v $PWD:/data -e INIT=true ${IMAGE_NAME}`);

  //     assert.ok((await lstat(".template/files/README.md")).isFile());
  //     assert.ok((await lstat(".template/options.json")).isFile());
  //     assert.ok((await lstat(".template/README.md")).isFile());
  //     assert.ok((await lstat(".template/init.sh")).isFile());
  //     assert.ok((await lstat("README.md")).isSymbolicLink());
  //   } finally {
  //     chdir("../..");
  //     await rm("test/meta-test", { recursive: true });
  //   }
  // }
);

async function testSuite(...tests) {
  for (const test of tests) {
    process.stdin.write(`${test.name}: `);
    await test();
    process.stdin.write(`OK\n`);
  }
}
