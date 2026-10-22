# Mushroom v2.0 — Friends Playtest

Version: friends-20261022-r1-9965eb0f

Development playtest for desktop browsers. No login or analytics. Progress stays in the browser.

This directory is isolated from the existing Fugata files. Do not replace the repository root or its Pages configuration.

To update: in the Mushroom development project run npm test and npm run build. Copy the current build manifest files into this directory, preserving older releases and every other repository path. Commit and push to main; the existing Pages build and deployment workflow publishes the update at the same URL. Entry HTML may remain cached briefly; check the Title version and use a hard refresh if necessary.
