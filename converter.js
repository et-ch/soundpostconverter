//MP3 to OGG convert code modified from https://devtails.medium.com/how-to-convert-audio-from-wav-to-mp3-in-node-js-using-ffmpeg-e5cb4af2da6

const { info } = require("console");
const fs = require("fs");
const { encode } = require("querystring");
const download = require('download');

const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const { lookup } = require("dns");

//*******USER VARIABLES YOU CAN CHANGE******//

let keepOriginalAudio = false;
let keepOgg = false; //set as true if original audio is .ogg and you want to keep it
let keepMp4 = true; //recommended to keep as true in case sound source is mp4, as it converts to webm badly.
let outputFolder = "files"; //leave blank if you want it to output to the current directory (not recommended)
let validAudioFileTypes = [".m4a", ".aac", ".wma", ".wav", ".mp4", ".flac", ".mp3"];
let useSubfolders = false; //recommended to set to true if keepOriginalAudio is set to true. set to false if converting large amounts of files at once.

//////////////////////////////////////////////

let stdout = "";
let stderr = "";
let soundName;
let soundURL;
let webmName;
let newWebmName;
let soundFileType;
let outputFilePath;
let oggSoundName;

console.log('Initialising.');
    
//change depending on useSubfolders setting.
if (useSubfolders === true) {
    outputFilePath = `${outputFolder}/${newWebmName}/`
} else {
    outputFilePath = `${outputFolder}/`
}

let fileNames = fs.readdirSync("./");

let soundpostsArray = [];
for (const fileName of fileNames) {
    if (fileName.match('sound=')) {
        soundpostsArray.push(fileName);
    }
}
if (soundpostsArray.length > 1) {
    //throw new Error("Oh nyo. Multiple soundposts detected in root directory.)");
    //for (const soundpost of soundpostsArray) {
        console.log("Multiple soundposts detected.")
        console.log(soundpostsArray);
        webmName = soundpostsArray[0];
        console.log('Trying to convert ' + webmName + ".");
        soundpostConvert(webmName);
    //}
}

function getWebmName() {
    for (const fileName of fileNames) {
        webmName = fileName.match('sound=');
        if (webmName != null) {
                webmName = webmName.input;
                console.log('Webm name has been detected as ' + webmName + ".");
                return webmName;
        }else {
            if (webmName = fileName.match('.webm')) {
                webmName = webmName.input;
                console.log('Webm name has been detected as ' + webmName + ".");
                return webmName;
            }
        }
    }
}

webmName = getWebmName();
if(webmName == undefined) {
    throw new Error('Oh nyo. No webm found in directory.');
}

if (soundpostsArray.length <= 1){
    soundpostConvert(webmName);
}

function soundpostConvert(soundpost) {
    function getNewWebmName(webmName) {
        //splits name and sound
        if (webmName.match('sound=')) {
            let newFileArray = webmName.split("[");
            console.log(newFileArray);
            newWebmName = newFileArray[0].trim() + '.webm';
            encodedSoundpostURL = '[' + newFileArray[1];
            console.log('New webm name: ' + newWebmName + ".");
            //console.log('Encoded URL: ' + encodedSoundpostURL);
            return newWebmName;
        } else {
            //add _sound in case in root folder.
            newWebmName = webmName.split(".")[0].trim() + '_sound' + ".webm";
            console.log('New webm name: ' + newWebmName + ".");
            return newWebmName;
        }
    }
    
    newWebmName = getNewWebmName(webmName);

    //finds the URL from soundpost name and gets file type.
    function detectSoundURL(webmName) {
        soundURL = decodeURIComponent(webmName.split('[')[1].split(']')[0].split('=')[1]);
        console.log('Sound URL has been detected as: ' + soundURL + ".");
        soundFileType = "." + soundURL.split(".")[3];
        console.log('Sound filetype has been detected as: ' + soundFileType + ".");
        return soundURL;
    }
    
    //if there is nothing in the URL, it checks root and files folder for if there is already one downloaded i.e. if it failed before or was downloaded manually.
    function getSoundName() {
        for (const fileName of fileNames) {
            for (const fileType of validAudioFileTypes) {
                soundName = fileName.match(fileType);
                if (soundName != null) {
                    soundName = soundName.input;
                    console.log('Sound URL not found in file name. Existing sound file has been retrieved in folder as: ' + soundName + ".");
                    return soundName;
                } else {
                    //check output directory
                    fileNames2 = fs.readdirSync(outputFilePath);
                    for (const fileName2 of fileNames2) {
                        soundName = fileName.match(fileType);
                        if (soundName != null) {
                                soundName = soundName.input;
                                console.log('Sound name has been detected as ' + soundName + ".");
                                return soundName;
                        }        
                    }
                }
            }
        }
        return console.log("No valid filetype file found.")
    }
    
    if (webmName.match("sound=")) {
        soundURL = detectSoundURL(webmName);
    }
    
    //if (fs.readdirSync(outputFilePath)) {
        //fs.mkdirSync(outputFilePath);
    //}
    //download
    if (soundURL != undefined) {
        if (soundURL.match("http")) {
            soundName = soundURL.split('/')[3];
        } else {
            soundName = soundURL.split(`/`)[1]
        }
        console.log('Sound name has been detected as: ' + soundName + ". Downloading.");
        download(soundURL, outputFilePath)
        .then(() => {
            console.log('Download Completed.');
            soundPath = (outputFilePath + soundName);
            continueScript();
        })
    }
    
    if (soundName == undefined) {
        soundName = getSoundName();
        continueScript();
    }
      
    //.then everything else happens after download completes
    function continueScript() {
        function renameFile(webmName, newWebmName) {
            fs.renameSync(webmName, newWebmName);
            console.log(`File name has been changed to ${newWebmName}`)
            return newWebmName;
        }
    
        function isOggFile(oggFilename) {
            const ext = path.extname(oggFilename);
            return ext === ".ogg";
        }
    
        function isOtherAudioFile(soundName) {
            const ext = path.extname(soundName);
            return ext === ".m4a" | ext === ".aac" | ext === ".wma" | ext === ".wav" | ext === ".mp4" | ext === ".flac" | ext === ".mp3";
        }

        function isWebm(soundName) {
            const ext = path.extname(soundName);
            return ext === ".webm";
        }

        function isMp4(soundName) {
            const ext = path.extname(soundName);
            return ext === ".mp4";
        }
    
        function convertToOgg(soundPath) {
            return new Promise((resolve, reject) => {
                if (!isOtherAudioFile(soundPath)) {
                    throw new Error(`Oh nyo. Not a valid audio file: ${soundPath}.`);
                }
                const outputFile = soundPath.replace(soundFileType, ".ogg");
                ffmpeg({
                    source: soundPath,
                }).on("error", (err) => {
                    reject(err);
                }).on("end", () => {
                    resolve(outputFile);
                }).save(outputFile);
            })
            .then(() => {
                return;
            })
        }

        if (!isOggFile(soundName) && !isWebm(soundName)) {
            convertToOgg(soundPath).then(() => {
                console.log('Sound file converted successfully!')
                continueScript2()
            });
        } else {
            console.log(`Sound file is already ${soundFileType}, file conversion skipped.`);
            if (isWebm(soundName)) {
                //skips the rest if source is webm
                renameFile(soundPath, `${outputFilePath}/${newWebmName}`);
                soundpostsArray.shift();
                if (soundpostsArray.length >= 1) {
                    webmName = soundpostsArray[0];
                    soundpostConvert(webmName);
                } else {
                    console.log('All conversions complete');
                    return;
                }
            }
            continueScript2();
        }
        //
        function continueScript2() {
            function getOggSoundName() {
                fileNames = fs.readdirSync("./");
                fileNames2 = fs.readdirSync(outputFilePath);
                //try 3 times in case it fails.
                for (i = 0; i < 3; i++) {
                    for (const fileName of fileNames) {
                        if (isOggFile(fileName)) {
                            oggSoundName = fileName;
                            if (oggSoundName != null) {
                                console.log('.ogg sound file has been retrieved as: ' + oggSoundName + ".");
                                return oggSoundName;
                            }
                        }
                    }
                    for (const fileName2 of fileNames2) {
                        if (isOggFile(fileName2)) {
                            oggSoundName = fileName2;
                            if (oggSoundName != null) {
                                oggSoundName = outputFilePath + oggSoundName;
                                console.log('Sound file path has been detected as ' + oggSoundName + ".");
                                return oggSoundName;
                            }        
                        }
                    } 
                }
                return console.log("Oh nyo. No .ogg file found.")
            }
        
            oggSoundName = getOggSoundName();

            if (isMp4(soundName)) {
                //uses this as "soundPath" variable has already been changed.
                soundName = renameFile(outputFilePath + soundName, outputFilePath + newWebmName.split(".")[0] + ".mp4")
            }

            //handling for if filename is blank, changes it to the name of the sound to avoid overwriting it.
            if (newWebmName == ".webm") {
                newWebmName = soundName.split(".")[0] + ".webm";
                console.log("Webm name is blank. Assigning soundName to newWebmName: " + newWebmName + ".");
            }
        
            function combineAudioAndVideo(oggSoundName, webmName) {
                return new Promise((resolve, reject) => {
                if (!isOggFile(oggSoundName)) {
                    throw new Error(`Oh nyo. Not a .ogg file.`);
                }
                //change this to wherever you want to output the webm.
                const outputFile = `${outputFilePath}${newWebmName}`;
                console.log('Conversion in progress. Please wait.');
                ffmpeg(oggSoundName)
                .input(webmName)
                .on("error", (err) => {
                    reject(err);
                }).on("end", () => {
                    resolve(outputFile);
                }).save(outputFile);
                });
            }
        
            combineAudioAndVideo(oggSoundName, webmName)
            .then(() => {
                console.log(`Audio and video successfully combined! New file output to ${outputFilePath}${newWebmName}.`);
                if (keepOgg === false) {
                    fs.unlinkSync(`${oggSoundName}`);
                }
                if (keepOriginalAudio === false) {
                    if (!soundFileType ===".mp4" && keepMp4 === false) {
                        if (!isOggFile(soundName)) {
                            fs.unlinkSync(`${soundName}`)
                        }
                    }
                }
                soundpostsArray.shift()
                if (soundpostsArray.length >= 1) {
                        webmName = soundpostsArray[0];
                        soundpostConvert(webmName);
                }
            })
        }
    }
}