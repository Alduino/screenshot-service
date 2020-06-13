# Screenshot CDN service
This project simply copies any new images from a specified glob into a Git repo (and converts them to webp), and pushes
the update.

However, the idea behind this project is that you then listen to pushes of that repo, and publish it to some domain
(for example, Netlify), which can act as a CDN for your screenshots.

Note that saving two screenshots at the same time should technically work, but you shouldn't do it as it hasn't been
tested. (If you do it, let me know what happens!)

## Installation
Clone the repo, and install dependencies with `npm i`, then run `npm start` to run the service. See below for setting
up as a Daemon on Linux to run in the background.

## Usage
Set the `BASE_URL` environment variable to the root domain where images will be served (including a trailing `/`).
Set the `WATCH_GLOB` environment variable to a glob to match any new images you want to handle.

## How it works
1. Detects any changes in the glob using Chokidar
2. Pulls any remote changes into the Git repo (assuming `remote/master`)
3. Copies the new file into a subdirectory in the git repo, converted to webp and using its hash as its name.
4. Adds and commits the new file
5. Pushes the file `remote/master`

What's next is up to you. Personally I've got Netlify hooked up to detect changes in a private repo, which publishes
it every time something changes.
