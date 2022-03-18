# unwrap-template

Docker image for unwrapping template repositories using EJS

## Usage

Create a folder called `.template` with `files` folder and `options.json` file inside.

Then run:

```bash
docker run -v $PWD:/data extenda/unwrap-template
```

Files from the `files` folder will be copied to the current working directory and transformed with EJS using `options.json` file as the input.
For more info on transformation see [EJS docs](https://ejs.co/).

## Mentions

Fork of <https://github.com/glebbash/unwrap-template>.
