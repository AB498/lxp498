const utf8 = require('utf8');
const { spawn } = require('child_process');
const pythonFile = 'test.py';
const args = [];

const path = require('path');
const fs = require('fs');
const { join } = require('path');
const findPackageJson = require('find-package-json');
const nearestPackageJson = findPackageJson(join(__dirname));
const rootDirectory = path.dirname(nearestPackageJson.next().filename);
const tmp = require('tmp');
var tasks = {};
var onReadyResolvers = [];
var ready = false;

let pythonProcess = null;

function getWords(lang, str) {
    return new Promise(async (resolve, reject) => {
        await waitForReady();
        var tmpobj = tmp.fileSync();
        // console.log('File: ', tmpobj.name);
        fs.writeFileSync(tmpobj.name, lang + ' ' + str, 'utf8');
        tasks[tmpobj.name] = {
            fileName: tmpobj.name,
            resolve: resolve
        };
        pythonProcess.stdin.write(tmpobj.name + '\n');
    });
}

function waitForReady() {
    return new Promise((resolve, reject) => {
        if (ready) {
            resolve();
        } else {
            onReadyResolvers.push(resolve);
        }
    });
}

module.exports = {
    getWordsFromSentence: getWords,
    exit,
    init
};

function exit() {
    pythonProcess.kill('SIGTERM');
}

function init() {
    pythonProcess = spawn('python', ['-u', join(rootDirectory, 'utils', 'SpacyTokenizer.py')]);
    pythonProcess.stdout.on('data', (data) => {
        if (data.toString().trim() == 'ready') {
            ready = true;
            onReadyResolvers.forEach((resolve) => {
                resolve();
            });
        }
        // let fl = (data.toString().trim().split(' ', 2))
        const input = data.toString().trim();
        const spaceIndex = input.indexOf(' ');

        let evt = '';
        let inf = '';
        // console.log(fl)
        try {
            if (spaceIndex >= 0) {
                evt = input.substring(0, spaceIndex).toString();
                inf = input.substring(spaceIndex + 1).toString().trim();
                console.log(inf)
            } else {
                inf = data.toString().trim();
            }
        } catch (e) {
            console.log(e)
            inf = data.toString().trim();
        }
        if (evt == 'done') {
            if (tasks[inf]) {
                tasks[inf].resolve(JSON.parse(fs.readFileSync(tasks[inf].fileName, 'utf8')));
                delete tasks[inf];
            }
        }
        else if (evt == 'error' || evt == 'error2') {
            if (tasks[inf]) {
                console.log('error: ' + inf);
                tasks[inf].resolve(null);
                delete tasks[inf];
            }
        } else {
            console.log('unknown event: ' + inf);
        }
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}

// (async () => {
//     console.log(await getWords('zh', '我只是不知道该说什么。'));
// })()

