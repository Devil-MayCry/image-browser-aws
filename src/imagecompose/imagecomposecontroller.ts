// Copyright 2017 huteng (huteng@gagogroup.com). All rights reserved.,
// Use of this source code is governed a license that can be found in the LICENSE file.
import * as multer from "multer";

import {Validator, BadRequestResponse, SuccessResponse, ErrorResponse, DateUtil} from "sakura-node";

import {BaseController, Request, Response, NextFunction} from "../base/basecontroller";
import {ImageComposeService} from "./imagecomposeservice";
import {ApplicationContext} from "../util/applicationcontext";

// specfify the upload compose picture file saving location
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let composeImageFilesSavingDir: string = ApplicationContext.getComposeImageFilesSavingDir();
    cb(null, composeImageFilesSavingDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  }
});

const upload = multer({ storage: storage}).single("uploadfile");

export class ImageComposeController extends BaseController {

  /**
   * Get the composed picture and put it in specify folder. It will be synchronized from aws to azure
   *
   * @static
   *
   * @memberOf ImageComposeController
   */
  static async uploadComposeImageToSynchronizeToAzure(req: Request, res: Response, next: NextFunction): Promise<void> {
    upload(req, res, (err: Error) => {
      if (err) {
        // An error occurred when uploading
        res.json(new ErrorResponse("UPLOAD_FILE_FAIL", 501));
      } else {
        res.json(new SuccessResponse({

        }));
      }
    });
  }

  /**
   * users upload their own algorithm code (python), use the code to create new pic and return to front
   * 
   * @memberOf ImageComposeController
   */
  static async insertImageComposeCodeFromClient(req: Request, res: Response, next: NextFunction): Promise<void> {
    let validator: Validator = new Validator();
    // TODO(huteng@gagogroup.com): lack of localtion and other info
    const pythonCodeWaitForInsert: string = validator.toStr(req.body["code"], "invalid code");
    const latitude: number = validator.toNumber(req.body["x"], "invalid latitude");
    const longitude: number = validator.toNumber(req.body["y"], "invalid longitude");
    const zoom: number = validator.toNumber(req.body["z"], "invalid zoom");

    const bandArray: string [] = req.body["bands"].substring(1, req.query["bands"].length - 1).split(",");

    // const originPictureNameArray: string [] = req.body["originPictureNameArray"].substring(1, req.query["originPictureNameArray"].length - 1).split(",");

    if (validator.hasErrors()) {
      res.json(new BadRequestResponse(validator.errors));
      return;
    }

    try {
      // Use now timestamp to tag and distinguish new code
      let nowTimeStamp: timestamp = DateUtil.millisecondToTimestamp(new Date().getTime());

      // Take the user new code part and insert into template to make a new algorithm
      let newScriptFilePath: string = await ImageComposeService.insertImageComposeCodeFromClient(pythonCodeWaitForInsert);

      // Use the gegograph info the get origin wave picture name, and get it from amzone s3 bucket, save to local for temp
      let originPictureFilePathArray: string[] = await ImageComposeService.getOriginWavePictureLocation(latitude, longitude, zoom, bandArray);
      // // Get origin picture from amzone s3 bucket, save to local for temp
      // let originPictureFilePathArray: string[] = await ImageComposeService.downloadOriginPicturesForCalculate(originPictureNameArray);

      // Use the origin picture and new script to make new picture, return to front
      let exportPictureFilePath = await ImageComposeService.calcualteAndExportNewPicByPython(newScriptFilePath, originPictureFilePathArray);
      res.sendFile(exportPictureFilePath);
    } catch (err) {
      if (err.message === "TEMPLATE_FILE_NO_EXIST") {
        res.json(new ErrorResponse("TEMPLATE_FILE_NO_EXIST", 501));
      } else if (err.message === "PYTHON_RUN_ERROR") {
        res.json(new ErrorResponse("PYTHON_RUN_ERROR", 501));
      } else if (err.message === "EXPORT_FILE_FAIL") {
        res.json(new ErrorResponse("EXPORT_FILE_FAIL", 501));
      }else {
        next(err);
      }
    }
  }

  /**
   * Save client own python code in server, which could re-use next time
   *
   * @static
   *
   * @memberOf ImageComposeController
   */
  static async saveClientOwnPythonCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    let validator: Validator = new Validator();

    const pythonCodeWaitForInsert: string = validator.toStr(req.body["code"], "invalid code");
    const pythonFileName: string = validator.toStr(req.body["fileName"], "invalid fileName");

    if (validator.hasErrors()) {
      res.json(new BadRequestResponse(validator.errors));
      return;
    }

    try {
      await ImageComposeService.saveClientOwnPythonCode(pythonCodeWaitForInsert, pythonFileName);
    } catch (err) {
      if (err.message === "FILE_NAME_EXIST") {
        res.json(new ErrorResponse("FILE_NAME_EXIST", 501));
      } else if (err.message === "TEMPLATE_FILE_NO_EXIST") {
        res.json(new ErrorResponse("TEMPLATE_FILE_NO_EXIST", 501));
      } else if (err.message === "SAVE_FAIL") {
        res.json(new ErrorResponse("SAVE_FAIL", 501));
      } else {
        next(err);
      }
    }
  }
}