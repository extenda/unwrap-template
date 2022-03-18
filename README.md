# unwrap-template

Docker image for unwrapping template repositories using EJS

## Usage

### Creating a template repository

1. Create a repository and run:

   ```bash
   docker run -v $PWD:/data -e DIR=$PWD -e INIT=true extenda/unwrap-template
   ```

   This will create the following structrure:

   - .template/
     - files/
     - options.json
     - README.md
     - init.sh
   - README.md (link to .template/README.md)

1. Place all the template files in `.template/files` folder.

1. Update `.template/options.json` with the default variables that are used to unwrap the template.

### Unwrapping a template

1. Update `.template/options.json` file with your specific variables.

1. Run:

   ```bash
   bash .template/init.sh
   ```

   or directly:

   ```bash
   docker run -v $PWD:/data extenda/unwrap-template
   ```

   Files from the `files` folder will be copied to the current working directory and transformed with EJS using `.template/options.json` as the input.

   For more info on transformation see [EJS docs](https://ejs.co/).
