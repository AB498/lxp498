const jwt = require('jsonwebtoken');

const path = require("path");
const { join } = require("path");
const findPackageJson = require('find-package-json');
const { error } = require('console');
const nearestPackageJson = findPackageJson(join(__dirname, "fword"));
const rootDirectory = path.dirname(nearestPackageJson.next().filename);

require("dotenv").config({ path: join(rootDirectory, ".env") });
const accessTokenSecret = process.env.SECRET_KEY;

function encode(payload) {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, accessTokenSecret, {
        }, (err, token) => {
            if (err) {
                reject(err)
            }
            resolve(token)
        })
    })
}
function decode(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, accessTokenSecret, (err, payload) => {
            if (err) {
                const message = err.name == 'JsonWebTokenError' ? 'Unauthorized' : err.message
                console.log(error)
                return resolve(null)
            }
            resolve(payload)
        })
    })
}
module.exports = { encode, decode }