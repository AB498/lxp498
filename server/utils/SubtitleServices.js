
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
    this.accessToken = "";
    this.progress = 0;
    this.bucket_name = "lxbucket"; // Replace with your bucket name
  }


  async generateSubtitles(videoId, lang, targetLang = null){

    console.log("Downloading video " + videoId);
    const [errors, downloadedFile] = await s.safeAsync(this.downloadMp3(videoId), this.downloadMp3);
    if (errors || !downloadedFile) return false;

    console.log("Checking if object exists " + downloadedFile);
    const [errors2, objExists] = await this.objectExists(downloadedFile);
    if (errors2) return false;

    if (!objExists) {
      console.log("Uploading object " + downloadedFile);
      const [errors3, uploaded] = await s.safeAsync(this.uploadObject(downloadedFile), this.uploadObject);
      if (errors3) return false;
    }

    console.log("Getting transcription " + downloadedFile);
    const [errors4, subtitles] = await s.safeAsync(this.getTranscription(downloadedFile, videoId, lang), this.getTranscription);

    if (errors4) return false;

    if (!subtitles) return false;

    await db.video.update({
      where: {
        ytId: videoId
      },
      data: {
        subtitleWords: JSON.stringify(subtitles)
      }
    });
    if (targetLang) {
      const [errors5, translated] = await s.safeAsync(this.getTranslation(subtitles, lang, targetLang), this.getTranslation);
      if (errors5) console.log(errors5);
      else {
        // await db.video.update({
        //   where: {
        //     ytId: videoId
        //   },
        //   data: {
        //     translatedWords: JSON.stringify(translated)
        //   }
        // });
      }

    }

    return true;

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

  async getTranscription(downloadedFile, videoId, lang){
    const endpoint = `https://speech.googleapis.com/v1p1beta1/speech:longrunningrecognize?key=${dataAPIKey}`;
    const requestData = {
      config: {
        encoding: "MP3",
        enableWordTimeOffsets: true,
        sampleRateHertz: 44100,
        languageCode: lang,
      },
      audio: {
        uri: "gs://speech_videos/" + downloadedFile,
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

    if (err2) return null;

    let words = [];
    for (let result of longRunningResult.data.response.results) {
      try {
        words = [...words, ...result.alternatives[0].words];
      } catch (error) { }
    }
    return words;

  }

  async objectExists(name) {


    const apiEndpoint = `https://www.googleapis.com/upload/storage/v1/b/${bucket_name}/o/${name}?alt=json`;
    try {
      const funcRes = await axios.get(apiEndpoint, {
        headers: {
          Authorization: `Bearer ${global.glb.accessToken}`,
          "Content-Type": "application/json",
        },
      })
    } catch (err) {
      console.log(err)
      return false;
    }
    // if (err.response.data.error.errors[0].reason == "notFound")
    // if (err.response.status == 404)
    if (err)
      return false;

    return true;



  };
  async getSuggestions(query) {
    const endpoint = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${query}&key=${dataAPIKey}`;
    const [err, resp] = await s.safeAsync(axios.get(endpoint), "axios");
    if (err) return null;
    return resp.data.items;
  }
  async uploadObject(name) {
    const apiEndpoint = `https://www.googleapis.com/storage/v1/b/${bucket_name}/o/${name}?alt=json`;
    const file_name = name; // Replace with your desired file name
    const file_path = downloadedVideosDirectory; // Replace with the local path to your file
    const file_stream = fs.createReadStream(file_path + "/" + file_name);
    const url = `https://www.googleapis.com/upload/storage/v1/b/${bucket_name}/o?uploadType=multipart&name=${name}`;
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
          this.progress = progress.percent;
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
  async getTranscriptionResults(operationName){
    let longRunningResultsUrl = `https://speech.googleapis.com/v1/operations/${operationName}`;

    const response = await axios.get(longRunningResultsUrl, {
      headers: {
        Authorization: `Bearer ${global.glb.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.data?.metadata?.progressPercent)
      this.progress = response.data?.metadata?.progressPercent;

    if (response.data.done) {
      return response;
    } else {
      console.log("Polling for transcription... Progress: " + this.progress);
      await this.timeout(10000);
      return await this.getTranscriptionResults(operationName);
    }
  }


  timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async searchVideos(keywordsString){


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