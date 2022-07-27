**You need npm and ffmpeg installed.**
Working with ffmpeg version 2021-12-30-git-12f21849e5-essentials_build-www.gyan.dev, npm version 8.13.2/ node version 18.6.0.

INSTRUCTIONS:
Place soundpost(s) in folder, open directory in terminal and type "node converter.js" or "npm start" to run. Output webm will appear in files.
Change variables at the top of the file as desired to keep audio, change directory etc.

Changelog:
*Now works for multiple soundposts at a time!
*Keeps mp4 if it was the audio sauce, and renames it to the soundpost name by default, as well as creating a webm from it.
*Outputs the webm as [name of the audio file].webm if the name was only the sound URL.