import { resolve } from "path";
import s from "../s";
const downloadedVideosDirectory = resolve("./downloadedVideos")
const YTDlpWrap = require("yt-dlp-wrap").default;
const binaryPath = "C:\\Users\\a\\Downloads\\yt-dlp_win\\yt-dlp.exe";
const ytDlpWrap = new YTDlpWrap();
import { db } from "../utils/db.server";
import axios from "axios";
import fs, { existsSync } from "fs";
const dataAPIKey = "AIzaSyDxM2_xcNQhj4ynuKgf3Epujijq74a_mnk";
class SubtitleServices {

  public accessToken: string;
  public progress: number;

  constructor() {
    this.accessToken = "";
    this.progress = 0;
    this.init();
  }
  async init() {
    this.accessToken = await this.getAccessToken();
  }
  async getAccessToken(): Promise<string> {
    const { auth } = require("google-auth-library");

    // load the environment variable with our keys
    const keysEnvVar = process.env["CREDS"];
    if (!keysEnvVar) {
      throw new Error("The $CREDS environment variable was not found!");
    }
    const keys = JSON.parse(keysEnvVar);

    // load the JWT or UserRefreshClient from the keys
    const client = auth.fromJSON(keys);
    client.scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/youtubepartner"
    ];
    return (await client.getAccessToken()).token;

  }

  async generateSubtitles(videoId: string, lang: string, targetLang: any = null): Promise<any> {

    console.log("Downloading video " + videoId);
    const [errors, downloadedFile] = await s.safeAsync(this.downloadMp3(videoId), this.downloadMp3);
    if (errors) return false;

    console.log("Checking if object exists " + downloadedFile);
    const [errors2, objExists] = await s.safeAsync(this.objectExists(downloadedFile), this.objectExists);
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

  async getTranslation(words: any, sourceLang: string, targetLang: string) {
    //googel translate api
    let endpoint = 'https://translation.googleapis.com/v3/projects/lanxplore:translateText';
    let [err, res] = await s.safeAsync(
      axios.post(endpoint, {
        "sourceLanguageCode": sourceLang,
        "targetLanguageCode": targetLang,
        "contents": (words.map((word: any) => word.word)),
        "mimeType": "text/plain"
      }, {
        headers: {
          Authorization: `Bearer ${global.glb.accessToken}`,
          "Content-Type": "application/json",
        }
      }), "axios");
    if (err || !res) return null;

    let data = await res.json();

    return words.map((word: any, index: any) => {
      try {
        return data.translations[index].translatedText;
      } catch (e) {
        console.log(e)
        return '';
      }
    });
  }

  async getTranscription(downloadedFile: string, videoId: string, lang: string): Promise<any> {
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

    let words: any[] = [];
    for (let result of longRunningResult.data.response.results) {
      try {
        words = [...words, ...result.alternatives[0].words];
      } catch (error) { }
    }
    return words;

  }

  async objectExists(name: string) {
    const apiEndpoint = `https://www.googleapis.com/storage/v1/b/speech_videos/o/${name}?alt=json`;

    let [err, res] = await s.safeAsync(
      axios.get(apiEndpoint, {
        headers: {
          Authorization: `Bearer ${global.glb.accessToken}`,
          "Content-Type": "application/json",
        },
      }), "axios");

    // if (err.response.data.error.errors[0].reason == "notFound")
    // if (err.response.status == 404)
    if (err || !res)
      return false;

    return true;



  };
  async getSuggestions(query: string) {
    const endpoint = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${query}&key=${dataAPIKey}`;
    const [err, resp] = await s.safeAsync(axios.get(endpoint), "axios");
    if (err) return null;
    return resp.data.items;
  }
  async uploadObject(name: string) {
    const apiEndpoint = `https://www.googleapis.com/storage/v1/b/speech_videos/o/${name}?alt=json`;
    const bucket_name = "speech_videos"; // Replace with your bucket name
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
  downloadMp3(videoId: string): Promise<string> {
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
        .on("progress", async (progress: any) => {
          // console.log(
          //   progress.percent,
          //   progress.totalSize,
          //   progress.currentSpeed,
          //   progress.eta
          // );
          this.progress = progress.percent;
          await db.video.update({
            where: {
              ytId: videoId
            },
            data: {
              subtitleGenerationProgress: progress.percent
            }
          });
        })
        .on("ytDlpEvent", (eventType: any, eventData: any) =>
        // console.log(eventType, eventData)
        { }
        )
        .on("error", (error: any) => reject(error))
        .on("close", () => {
          resolve("_yt_" + videoId + ".m4a");
        });
      console.log(ytDlpEventEmitter.ytDlpProcess.pid);
    });
  };
  async getTranscriptionResults(operationName: string): Promise<any> {
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


  timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async searchVideos(keywordsString: string): Promise<any> {


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

let videoAPIServices: SubtitleServices;

declare global {
  var __videoAPIServices: SubtitleServices | undefined;
}

if (!global.__videoAPIServices) {
  global.__videoAPIServices = new SubtitleServices();
}
videoAPIServices = global.__videoAPIServices;


export default videoAPIServices
function handleAxiosPromise(promise: any) {
  return promise.then((response: any) => {
    return response.data;
  }).catch((error: any) => {
    const { message, name, stack, config } = error;
    const response = error.response ? {
      status: error.response.status,
      statusText: error.response.statusText,
      headers: error.response.headers,
      data: error.response.data
    } : undefined;
    const errorObject = { message, name, stack, config, response };

    require('fs').writeFileSync('axiosError.log', JSON.stringify(errorObject));
    console.log("axios error");
    return { error: errorObject };
  });
}
function handleAsyncError(asyncFn: any) {
  return (async function (...args: any) {
    try {
      return await asyncFn(...args);
    } catch (errorObject) {
      require('fs').writeFileSync('asyncError.log', JSON.stringify(errorObject));
      console.log("async function error");
      return { error: errorObject };
    }
  })();
}

