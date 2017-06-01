// Copyright 2017 huteng (huteng@gagogroup.com). All rights reserved.,
// Use of this source code is governed a license that can be found in the LICENSE file.

import *as fs from "fs";
import * as child_process from "child_process";

import * as pythonShell from "python-shell";
import * as async from "async";

import {DateUtil} from "sakura-node";

import {BaseService} from "../base/baseservice";
import {ApplicationContext} from "../util/applicationcontext";

export class ImageComposeService extends BaseService {

  /**
   * Use the client code part to export new image comose code, and save it for temp
   *
   * @static
   * @param {string} pythonCode
   * @returns {Promise<timestamp>}
   *
   * @memberOf ImageComposeService
   */
  static async insertImageComposeCodeAndSavingForTemp(pythonCode: string): Promise<timestamp> {
    return new Promise<timestamp>((resolve, reject) => {
      let nowTimeStamp: timestamp = DateUtil.millisecondToTimestamp(new Date().getTime());
      let imageComposeCodeFilePath: string = ApplicationContext.getImageComposeCodeLocation();
      // If template file is exist
      fs.stat(imageComposeCodeFilePath, (err: Error, stats: fs.Stats) => {
        if (err) {
          reject(new Error ("TEMPLATE_FILE_NO_EXIST"));
        } else {
          let fileTemplateContent: string = fs.readFileSync(imageComposeCodeFilePath).toString();
          let newFileContentInString: string = fileTemplateContent.replace(`[$]`, pythonCode);
          let newScriptFilePath: string = `/tmp/imagecomposecode_${nowTimeStamp}.py`;

          fs.writeFile(newScriptFilePath, newFileContentInString, (err: Error) => {
            if (err) {
              reject(new Error ("EXPORT_FILE_FAIL"));
            } else {
              resolve(nowTimeStamp);
            }
          });
        }
      });
    });
  }

  static async checkFileExist(imageFilePathArray: string[]): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      async.map(imageFilePathArray, (file, done) => {
        console.log(file);
        fs.stat(file, (err, stats) => {
          if (stats) {
            console.log("exist");
            console.log(stats);
            done();
          } else {
            console.log("no exist");
            console.log(err);
            done(err);
          }
        });
      }, (err: Error, results: any) => {
        if (err) reject(new Error ("IMAGE_FILE_NO_EXIST"));
        else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Execute python script to export new picture, return to front
   *
   * @static
   * @param {string} pythonCodePath: python script file path
   * @param {string[]} pictureFilePathArray: script parameters
   * @returns {Promise<string>} return export picture file path
   *
   * @memberOf ImageComposeService
   */
  static async calcualteAndExportNewPicByPython(pythonCodeId: string,
                                                pictureFilePathArray: string[]): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let pythonCodePath: string;
      if (pythonCodeId === undefined) {
        pythonCodePath = ApplicationContext.getOriginImageComposeCodeLocation();
      } else {
        pythonCodePath = `/tmp/imagecomposecode_${pythonCodeId}.py`;
      }
        console.log(pythonCodePath);

      let nowTimeStamp: timestamp = DateUtil.millisecondToTimestamp(new Date().getTime());

      let exportPicturePath: string = `/tmp/exportNewPicture_${nowTimeStamp}.png`;

      let  process: child_process.ChildProcess = child_process.spawn("/root/miniconda3/bin/python", [pythonCodePath, ...pictureFilePathArray, exportPicturePath]);
      process.stderr.on("data", (err) => {
        if (err) {
          reject(new Error("PYTHON_RUN_ERROR"));
        }
      });
      process.on("close", (code) => {
        resolve(exportPicturePath);
      });
    });
  }

  static getOriginWaveImagePaths_(year: number, month: number, day: number, x: number, y: number, z: number, bandArray: string[]): string[] {
    let originWaveImagePathArray: string[] = [];
    let originImageDir = ApplicationContext.getOriginWaveImageDir();
    for (let eachBand of bandArray) {
      let imagePath: string = `${originImageDir}${year}/${month}/${day}/${eachBand}/${z}/${x}/${y}.tiff`;
      originWaveImagePathArray.push(imagePath);
    }
    return originWaveImagePathArray;
  }

  static async saveClientOwnPythonCode(clientOwnPythonCodePart: string, fileName: string): Promise<void> {

    // Get the image compose code template
    let imageComposeCodeTemplateFilePath: string = ApplicationContext.getImageComposeCodeLocation();
    try {

      // If template file is exist
      fs.accessSync(imageComposeCodeTemplateFilePath);
    } catch (err) {
      throw new Error ("TEMPLATE_FILE_NO_EXIST");
    }

    // Insert client own code to produce new code
    let fileTemplateContent: string = fs.readFileSync(imageComposeCodeTemplateFilePath).toString();
    let newFileContentInString: string = fileTemplateContent.replace(`[$]`, clientOwnPythonCodePart);

    // Saving user own code
    let pythonFileSavingDir: string = ApplicationContext.getPythonFilesSavingDir();
    let savingFilePath: string = pythonFileSavingDir + fileName;

    let stats: boolean = fs.existsSync(savingFilePath);

    // if file name is not exist
    if ( ! stats) {
      try {
        fs.writeFileSync(savingFilePath, newFileContentInString);
      } catch (err) {
        throw new Error("SAVE_FAIL");
      }
    } else {
      throw new Error("FILE_NAME_EXIST");
    }
  }
}