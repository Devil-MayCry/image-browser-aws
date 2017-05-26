// Copyright 2017 huteng (huteng@gagogroup.com). All rights reserved.,
// Use of this source code is governed a license that can be found in the LICENSE file.

import *as fs from "fs";
import * as pythonShell from "python-shell";

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
      let options: json = {
        args: [...pictureFilePathArray]
      };

      let pythonCodePath: string;
      if (pythonCodeId === undefined) {
        pythonCodePath = ApplicationContext.getOriginImageComposeCodeLocation();
      } else {
        pythonCodePath = `/tmp/imagecomposecode_${pythonCodeId}.py`;
      }

      let nowTimeStamp: timestamp = DateUtil.millisecondToTimestamp(new Date().getTime());

      let exportPicturePath: string = `/tmp/exportNewPicture_${nowTimeStamp}.jp2`;
      pythonShell.run(pythonCodePath, options,  (err: Error) => {
        if (err) {
          reject(new Error("PYTHON_RUN_ERROR"));
        } else {
          resolve(exportPicturePath);
        }
      });
    });
  }

  static async getOriginWavePictureLocation(x: number, y: number, z: number, bandArray: string[]): Promise<string[]> {
    return [];
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