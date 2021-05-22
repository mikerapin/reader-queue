# comiXology Reader Queue

A simple extension that allows you to queue items for reading.

When you reach the end of a comic, you'll be prompted to read the next item in your queue.

Manage your queue in the My Books section of the site.

Author: Mike Rapin - [@mikerapin](https://www.twitter.com/mikerapin)

## Development Instructions

1. Clone the package
2. cd into the package folder
3. run `npm install`
4. run one of the commands below

### `npm run dev`

Builds the app for development to the `public` folder. **Please do not commit this output.**

You can load the extension using the Load Unpacked function of Chrome by pointing at the `public` folder after you have run `npm run dev` in the base directory of this project.

You will need to refresh the extension in Chrome after every build (yes, this is annoying).

### `npm run build`

Builds the app for production to the `public` folder. **Please DO commit this output.**\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\

### Credits

Icons:

- https://heroicons.com/
- https://simpleicons.org/

Baseline:

- https://github.com/martellaj/chrome-extension-react-typescript-boilerplate
