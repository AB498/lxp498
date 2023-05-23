
const path = require('path');
const fs = require('fs');
const { join } = require('path');
const findPackageJson = require('find-package-json');
const nearestPackageJson = findPackageJson(join(__dirname));
const rootDirectory = path.dirname(nearestPackageJson.next().filename);
const models = require(join(rootDirectory, 'models'));
const { resolve } = require("path");
const s = require("../s");
const downloadedVideosDirectory = join(rootDirectory, "downloadedVideos");
const YTDlpWrap = require("yt-dlp-wrap").default;
const binaryPath = "C:\\Users\\a\\Downloads\\yt-dlp_win\\yt-dlp.exe";
const ytDlpWrap = new YTDlpWrap();
const axios = require("axios");
const dataAPIKey = "AIzaSyBOKyTuKxZ7JsseOhXzLvQ5ChVkYmtgG8Y";
class SubtitleServices {
  constructor() {
    this.processes = {};
    this.bucket_name = "lxbucket"; // Replace with your bucket name
  }

  addCallback(videoId, callback) {
    if (!this.processes[videoId]) {
      this.processes[videoId] = {
        status: -1,
        progress: 0,
        videoId,
        callbacks: [],
      };
    }
    this.processes[videoId].callbacks.push(callback);
  }


  async generateSubtitles(videoId, lang, targetLang = null) {


    if (!videoId) return false;
    if (!lang) return false;
    if (this.processes[videoId]?.status == 0) return false;
    if (!this.processes[videoId]) {
      this.processes[videoId] = {
        status: 0,
        progress: 0,
        videoId,
        callbacks: [],
      };
    }

    let foundvideo = (await models.Video.findOne({ where: { ytId: videoId } }));
    if (!foundvideo) {
      foundvideo = await models.Video.create({
        ytId: videoId,
        subtitleGenerationProgress: 0,
      });
    }
    if (foundvideo.subtitlesAvailable == 1) {
      this.processes[videoId].status = 1;
      this.processes[videoId].progress = 100;
      this.processes[videoId].callbacks.forEach((callback) => {
        callback({ status: 1, progress: 100 });
      });
      delete this.processes[videoId];
      return true;
    }

    foundvideo.subtitlesAvailable = 0;
    await foundvideo.save();

    console.log("starting, callbacks: ", this.processes[videoId].callbacks.length);
    this.processes[videoId].status = 0;
    this.processes[videoId].progress = 0;
    this.processes[videoId].callbacks.forEach((callback) => {
      callback({ status: this.processes[videoId].status, progress: this.processes[videoId].progress });
    });

    console.log("Downloading video " + videoId);
    const [errors, downloadedFile] = await s.safeAsync(this.downloadMp3(videoId), this.downloadMp3);
    if (errors || !downloadedFile) {

      this.processes[videoId].status = -2;
      this.processes[videoId].progress = -1;
      this.processes[videoId].callbacks.forEach((callback) => {
        callback({ status: this.processes[videoId].status, progress: this.processes[videoId].progress });
      });
      delete this.processes[videoId];
      return false;

    }


    this.processes[videoId].status = 0;
    this.processes[videoId].progress = 25;
    this.processes[videoId].callbacks.forEach((callback) => {
      console.log("donwloading");
      callback({ status: this.processes[videoId].status, progress: this.processes[videoId].progress });
    });

    if (! await this.objectExists(downloadedFile)) {
      console.log("Uploading object cuz doesnt exist " + downloadedFile);
      const [errors3, uploaded] = await s.safeAsync(this.uploadObject(downloadedFile), this.uploadObject);
      if (errors3) {

        this.processes[videoId].status = -2;
        this.processes[videoId].progress = -1;
        this.processes[videoId].callbacks.forEach((callback) => {
          callback({ status: this.processes[videoId].status, progress: this.processes[videoId].progress });
        });
        delete this.processes[videoId];
        return false;

      }
    }


    this.processes[videoId].status = 0;
    this.processes[videoId].progress = 50;
    this.processes[videoId].callbacks.forEach((callback) => {
      callback({ status: this.processes[videoId].status, progress: this.processes[videoId].progress });
    });
    console.log("Getting transcription " + downloadedFile);
    const [errors4, subtitles] = await s.safeAsync(this.getTranscription(downloadedFile, videoId, lang), this.getTranscription);

    if (errors4 || !subtitles) {

      this.processes[videoId].status = -2;
      this.processes[videoId].progress = -1;
      this.processes[videoId].callbacks.forEach((callback) => {
        callback({ status: this.processes[videoId].status, progress: this.processes[videoId].progress });
      });
      delete this.processes[videoId];
      return false;

    }


    foundvideo.subtitlesAvailable = 1;
    foundvideo.subtitleWords = subtitles;
    await foundvideo.save();
    this.processes[videoId].status = 1;
    this.processes[videoId].progress = 100;
    this.processes[videoId].callbacks.forEach((callback) => {
      callback({ status: this.processes[videoId].status, progress: this.processes[videoId].progress });
    });
    delete this.processes[videoId];
    return subtitles;

  }

  async getTranslation(words, sourceLang, targetLang) {
    //googel translate api
    let endpoint = 'https://translation.googleapis.com/v3/projects/lanxplore:translateText';
    let [err, res] = await s.safeAsync(
      axios.post(endpoint, {
        "sourceLanguageCode": sourceLang,
        "targetLanguageCode": targetLang,
        "contents": (words.map((word) => word.word)),
        "mimeType": "text/plain"
      }, {
        headers: {
          Authorization: `Bearer ${global.glb.accessToken}`,
          "Content-Type": "application/json",
        }
      }), "axios");
    if (err || !res) return null;

    let data = await res.json();

    return words.map((word, index) => {
      try {
        return data.translations[index].translatedText;
      } catch (e) {
        console.log(e)
        return '';
      }
    });
  }

  async getTranscription(downloadedFile, videoId, lang) {
    const endpoint = `https://speech.googleapis.com/v1p1beta1/speech:longrunningrecognize?key=${dataAPIKey}`;
    const requestData = {
      config: {
        encoding: "MP3",
        enableWordTimeOffsets: true,
        sampleRateHertz: 44100,
        languageCode: lang,
      },
      audio: {
        uri: `gs://${this.bucket_name}/` + downloadedFile,
      },
    };
    const [err, resp] = await s.safeAsync(axios.post(endpoint, requestData, {
      headers: {
        Authorization: `Bearer ${global.glb.accessToken}`,
        "Content-Type": "application/json",
      },
    }))

    if (err || !resp) return null;

    const [err2, longRunningResult] = await s.safeAsync(this.getTranscriptionResults(resp.data.name), this.getTranscriptionResults);
    if (err2 || !longRunningResult) return null;

    let words = [];
    for (let result of longRunningResult.data.response.results) {
      try {
        words = [...words, ...result.alternatives[0].words];
      } catch (error) { }
    }
    return words;

  }

  async objectExists(name) {


    const apiEndpoint = `https://www.googleapis.com/storage/v1/b/${this.bucket_name}/o/${name}?alt=json`;
    try {
      const funcRes = await axios.get(apiEndpoint, {
        headers: {
          Authorization: `Bearer ${global.glb.accessToken}`,
          "Content-Type": "application/json",
        },
      })
    } catch (err) {
      // console.log(err)
      return false;
    }
    return true;
    // if (err.response.data.error.errors[0].reason == "notFound")
    // if (err.response.status == 404)



  };
  async getSuggestions(query) {
    const endpoint = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${query}&key=${dataAPIKey}`;
    const [err, resp] = await s.safeAsync(axios.get(endpoint), "axios");
    if (err) return null;
    return resp.data.items;
  }
  async uploadObject(name) {
    const apiEndpoint = `https://www.googleapis.com/storage/v1/b/${this.bucket_name}/o/${name}?alt=json`;
    const file_name = name; // Replace with your desired file name
    const file_path = downloadedVideosDirectory; // Replace with the local path to your file
    const file_stream = fs.createReadStream(file_path + "/" + file_name);
    const url = `https://www.googleapis.com/upload/storage/v1/b/${this.bucket_name}/o?uploadType=multipart&name=${name}`;
    const [err, funcRes] = await s.safeAsync(axios.post(url, file_stream, {
      headers: {
        Authorization: `Bearer ${global.glb.accessToken}`,
        "Content-Type": "audio/mpeg",
      },
    }), "axios Upload Object")
    if (err) return false;
    return true;

  };
  downloadMp3(videoId) {
    return new Promise((resolve, reject) => {
      let ytDlpEventEmitter = ytDlpWrap
        .exec([
          "https://www.youtube.com/watch?v=" + videoId,
          "-f",
          "worstaudio[ext=m4a]/bestaudio[ext=m4a]/worst[ext=m4a]/best[ext=m4a]",
          "-x",
          "-o",
          downloadedVideosDirectory + "/_yt_" + videoId + ".m4a",
        ])
        .on("progress", async (progress) => {
          // console.log(
          //   progress.percent,
          //   progress.totalSize,
          //   progress.currentSpeed,
          //   progress.eta
          // );
          await models.Video.update({
            subtitleGenerationProgress: progress.percent
          }, {
            where: {
              ytId: videoId
            },
          });
        })
        .on("ytDlpEvent", (eventType, eventData) =>
        // console.log(eventType, eventData)
        { }
        )
        .on("error", (error) => reject(error))
        .on("close", () => {
          resolve("_yt_" + videoId + ".m4a");
        });
      console.log(ytDlpEventEmitter.ytDlpProcess.pid);
    });
  };
  async getTranscriptionResults(operationName) {
    let longRunningResultsUrl = `https://speech.googleapis.com/v1/operations/${operationName}`;

    const response = await axios.get(longRunningResultsUrl, {
      headers: {
        Authorization: `Bearer ${global.glb.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.data?.done) {
      return response;
    } else {
      global.glb.log("Polling for transcription..." + "Progress: " + (response.data?.metadata?.progressPercent || 0));
      await this.timeout(10000);
      return await this.getTranscriptionResults(operationName);
    }
  }


  timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async searchVideos(keywordsString) {


    // Set the API endpoint and parameters
    const apiEndpoint = "https://www.googleapis.com/youtube/v3/search";
    const params = {
      q: keywordsString,
      part: "snippet",
      type: "video",
      maxResults: 10,
      chart: "mostPopular",
      regionCode: "US", // replace with the region code you want to use
      key: dataAPIKey,
    };

    // Set the authorization header with your access token
    const headers = {
      Authorization: "Bearer " + global.glb.accessToken,
    };

    // Make the API request

    try {
      const response = await axios.get(apiEndpoint, { params, headers });

      // fs.writeFileSync("resp.json", JSON.stringify(response.data));
      // console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  };
}


if (!global.__videoAPIServices) {
  global.__videoAPIServices = new SubtitleServices();
}
videoAPIServices = global.__videoAPIServices;

module.exports.videoAPIServices = videoAPIServices;