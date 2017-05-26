// Copyright 2017 huteng (huteng@gagogroup.com). All rights reserved.,
// Use of this source code is governed a license that can be found in the LICENSE file.

import * as path from "path";

/**
 *  local machine, development server on Microsoft Azure, production server on Aliyun and local mocha test.
 */
export enum NodeEnv {
  LOCAL,
  DEVELOPMENT_SERVER,
  PRODUCTION_SERVER,
  TEST,
  GITLAB_RUNNER
}

/**
 * Application context for some metadata storage.
 */
export class ApplicationContext {
  private static instance_: ApplicationContext;
  private static nodeEnv_: NodeEnv;
  private configJson_: any;

  constructor() {
    this.configJson_ = require(ApplicationContext.projectConfigPath());
    this.isValidConfig_();
  }

  static getInstance(): ApplicationContext {
    if (!ApplicationContext.instance_) {
      ApplicationContext.instance_ = new ApplicationContext();
    }
    return ApplicationContext.instance_;
  }

  static setInstance(instance: ApplicationContext): void {
    ApplicationContext.instance_ = instance;
  }

  /**
   * Gets Node.js environment.
   * @returns {NodeEnv} Node.js environment.
   */
  static getNodeEnv(): NodeEnv {
    let nodeEnv: string = process.env["NODE_ENV"];

    if (ApplicationContext.nodeEnv_) {
      return ApplicationContext.nodeEnv_;
    }

    if (nodeEnv === "production") {
      ApplicationContext.nodeEnv_ = NodeEnv.PRODUCTION_SERVER;
    } else if (nodeEnv === "development") {
      ApplicationContext.nodeEnv_ = NodeEnv.LOCAL;
    } else if (nodeEnv === "development_server") {
      ApplicationContext.nodeEnv_ = NodeEnv.DEVELOPMENT_SERVER;
    } else if (nodeEnv === "test") {
      ApplicationContext.nodeEnv_ = NodeEnv.TEST;
    } else if (nodeEnv === "gitlab_runner") {
      ApplicationContext.nodeEnv_ = NodeEnv.GITLAB_RUNNER;
    } else {
      throw Error("Undefined NODE_ENV");
    }
    return ApplicationContext.nodeEnv_;
  }

  /**
   * Returns project config file path.
   * @returns {string} config path.
   */
  static projectConfigPath(nodeEnv?: NodeEnv): string {
    if (!nodeEnv) {
      nodeEnv = ApplicationContext.getNodeEnv();
    }
    return path.resolve(`${__dirname}/../../config/${ApplicationContext.configSubFolderName_(nodeEnv)}/project.config.json`);
  }

  /**
   * 返回图片融合python模版代码的位置
   */
  static getImageComposeCodeLocation(): string {
    const imageComposeCodeLocation: string = require(ApplicationContext.projectConfigPath())["imageCompose"]["pythonCodeLocation"];
    return imageComposeCodeLocation;
  }

  /**
   * 返回图片融合python代码（固定算法）的位置
   */
  static getOriginImageComposeCodeLocation(): string {
    const originImageComposeCodeLocation: string = require(ApplicationContext.projectConfigPath())["imageCompose"]["originPythonCodeLocation"];
    return originImageComposeCodeLocation;
  }

  /**
   * Returns base URL by env.
   */
  static baseUrl(): string {
    const baseConfigJson: any = require(ApplicationContext.projectConfigPath())["base"];
    return baseConfigJson["url"];
  }

  /**
   * 返回图片融合python代码的位置
   */
  static getOriginWavePictureLocation(): string {
    const originWavePictureDir: string = require(ApplicationContext.projectConfigPath())["imageCompose"]["originWavePictureDir"];
    return originWavePictureDir;
  }

  /**
   * 返回存储用户自定义图片融合python代码的目录
   */
  static getPythonFilesSavingDir(): string {
    const pythonFileSavingDir: string = require(ApplicationContext.projectConfigPath())["imageCompose"]["pythonFilesSavingDir"];
    return pythonFileSavingDir;
  }

  /**
   * 返回存储用户自定义图片的目录, 系统会自动将该文件夹的图片同步到azure服务器上
   */
  static getComposeImageFilesSavingDir(): string {
    const composeImageFilesSavingDir: string = require(ApplicationContext.projectConfigPath())["imageCompose"]["composeImageFilesSavingDir"];
    return composeImageFilesSavingDir;
  }

  /**
   * node_modules 路径
   */
  private static nodeModulesPath_(): string {
    return path.resolve(`${__dirname}/../../node_modules`);
  }

  /**
   * imageBrowser web dist path
   */
  static getImageBrowserDistPath(): string {
    return `${ApplicationContext.nodeModulesPath_()}/image-browser/dist`;
  }

  /**
   * 校验 project.config.json 是否符合格式
   */
  private isValidConfig_(): boolean {
    this.assertJsonHasOwnProperty_(this.configJson_, "version");

    this.assertJsonHasOwnProperty_(this.configJson_, "imageCompose");
    this.assertJsonHasOwnProperty_(this.configJson_["imageCompose"], "pythonCodeLocation");
    this.assertJsonHasOwnProperty_(this.configJson_["imageCompose"], "originWavePictureDir");
    this.assertJsonHasOwnProperty_(this.configJson_["imageCompose"], "pythonFilesSavingDir");
    this.assertJsonHasOwnProperty_(this.configJson_["imageCompose"], "composeImageFilesSavingDir");
    this.assertJsonHasOwnProperty_(this.configJson_["imageCompose"], "originPythonCodeLocation");

    return true;
  }

  private assertJsonHasOwnProperty_(inputJson: any, key: string): void {
    if (!inputJson.hasOwnProperty(key)) {
      throw new Error(`Key ${key} is not found in config/${ApplicationContext.configSubFolderName_()}/project.config.json, 
      please check config/template/project.config.json for more details`);
    }
  }

  private static configSubFolderName_(env?: NodeEnv): string {
    let nodeEnv: NodeEnv = env;
    if (nodeEnv === undefined) {
      nodeEnv = ApplicationContext.getNodeEnv();
    }

    switch (nodeEnv) {
      case NodeEnv.PRODUCTION_SERVER: return "aws";
      case NodeEnv.LOCAL: return "local";
      case NodeEnv.TEST: return "test";
      case NodeEnv.DEVELOPMENT_SERVER: return "azure";
      case NodeEnv.GITLAB_RUNNER: return "ci";
    }
  }
}
