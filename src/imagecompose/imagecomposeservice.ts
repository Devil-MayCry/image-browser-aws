// Copyright 2017 huteng (huteng@gagogroup.com). All rights reserved.,
// Use of this source code is governed a license that can be found in the LICENSE file.
import *as fs from "fs";
import * as pythonShell from "python-shell";

import {DateUtil} from "sakura-node";

import {BaseService} from "../base/baseservice";
import {ApplicationContext} from "../util/applicationcontext";

export class ImageComposeService extends BaseService {
  static async insertImageComposeCodeFromClient(pythonCode: string): Promise<string> {
    let imageComposeCodeFilePath: string = ApplicationContext.getImageComposeCodeLocation();
    try {
      // If template file is exist
      fs.accessSync(imageComposeCodeFilePath);
    } catch (err) {
      throw new Error ("TEMPLATE_FILE_NO_EXIST");
    }

    try {
      let nowTimeStamp: timestamp = DateUtil.millisecondToTimestamp(new Date().getTime());
      let fileTemplateContent: string = fs.readFileSync(imageComposeCodeFilePath).toString();
      let newFileContentInString: string = fileTemplateContent.replace(`$[]`, pythonCode);

      let newScriptFilePath: string = `/tmp/imagecomposecode_${nowTimeStamp}.py`;

      fs.writeFileSync(newScriptFilePath, newFileContentInString);

      return newScriptFilePath;
    } catch (err) {
      throw new Error ("EXPORT_FILE_FAIL");
    }
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
  static async calcualteAndExportNewPicByPython(pythonCodePath: string,
                                                pictureFilePathArray: string[]): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let options: json = {
        args: [...pictureFilePathArray]
      };

      let nowTimeStamp: timestamp = DateUtil.millisecondToTimestamp(new Date().getTime());
      // TODO(huteng@gagogroup.com): or JPG?
      let exportPicturePath: string = `/tmp/exportNewPicture_${nowTimeStamp}.jp2`;
      pythonShell.run(pythonCodePath, options,  (err: Error) => {
        if (err) throw new Error("PYTHON_RUN_ERROR");
        resolve(exportPicturePath);
      });
    });
  }

  static async getOriginWavePictureLocation(platitude: number, longitude: number, zoom: number, bandArray: string[]): Promise<string[]> {
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
    let newFileContentInString: string = fileTemplateContent.replace(`$[]`, clientOwnPythonCodePart);

    // Saving user own code
    let pythonFileSavingDir: string = ApplicationContext.getPythonFilesSavingDir();
    let savingFilePath: string = pythonFileSavingDir + fileName;
    let stats: fs.Stats = fs.statSync(savingFilePath);

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