// Copyright 2017 huteng (huteng@gagogroup.com). All rights reserved.,
// Use of this source code is governed a license that can be found in the LICENSE file.

import {ApplicationContext, NodeEnv} from "../util/applicationcontext";

export class TestContext {

  /**
   * Returns base url of api.
   * @param version api version.
   * @returns {string} Base URL of api.
   */
  static BASE_URL(version: number = 0): string {
    const nodeEnv: NodeEnv = ApplicationContext.getNodeEnv();

    let versionStr: string = "beta";
    if (version === 0) versionStr = "beta";

    return `http://localhost:3000/api/${versionStr}`;
    // switch (nodeEnv) {
    //   // case NodeEnv.PRODUCTION_SERVER: throw `http://api.gagogroup.cn:3000/api/${versionStr}`;
    //   // case NodeEnv.DEVELOPMENT_SERVER: return `http://dev.gagogroup.cn:3000/api/${versionStr}`;
    //   // default: return `http://localhost:3000/api/${versionStr}`;
    // }
  }
}