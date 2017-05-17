// Copyright 2017 huteng (huteng@gagogroup.com). All rights reserved.,
// Use of this source code is governed a license that can be found in the LICENSE file.
import {Validator, BadRequestResponse, SuccessResponse, ErrorResponse, DateUtil} from "sakura-node";

import {BaseController, Request, Response, NextFunction} from "../base/basecontroller";
import {ImageComposeService} from "./imagecomposeservice";

export class ImageComposeController extends BaseController {
  /**
   * users upload their own algorithm code (python), use the code to create new pic and return to front
   * 
   * @memberOf ImageComposeController
   */
  static async insertImageComposeCodeFromClient(req: Request, res: Response, next: NextFunction): Promise<void> {
    let validator: Validator = new Validator();
    // TODO(huteng@gagogroup.com): lack of localtion and other info
    const pythonCodeWaitForInsert: string = validator.toStr(req.body["code"], "invalid code");
    const latitude: number = validator.toNumber(req.body["lat"], "invalid latitude");
    const longitude: number = validator.toNumber(req.body["lon"], "invalid longitude"); 
    const zoom: number = validator.toNumber(req.body["zoom"], "invalid zoom"); 

    const bandArray: string [] = req.body["bands"].substring(1, req.query["features"].length - 1).split(",");
    
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
      let originPictureFilePathArray: string[] = await ImageComposeService.downloadOriginPicturesForCalculate(latitude, longitude, zoom, bandArray);
      
      // Use the origin picture and new script to make new picture, return to front
      let exportPictureFilePath = await ImageComposeService.calcualteAndExportNewPicByPython(newScriptFilePath, originPictureFilePathArray);
    } catch (err) {
      if(err.message === "TEMPLATE_FILE_NO_EXIST") {
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
}