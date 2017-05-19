// Copyright 2017 huteng (huteng@gagogroup.com). All rights reserved.,
// Use of this source code is governed a license that can be found in the LICENSE file.
import * as supertest from "supertest";
import * as fs from "fs";
import * as chai from "chai";
import * as path from "path";

import {TestContext} from "../testcontext";
import {ImageComposeController} from "../../imagecompose/imagecomposecontroller";
import {ApplicationContext} from "../../util/applicationcontext";

describe("ImageComposeController", () => {

  const url: string = TestContext.BASE_URL();

  describe("test picture file upload", () => {
    it("test upload a picture file", (done: MochaDone) => {
      supertest(url)
      .post("/image/saving_compose_picture")
      .attach("uploadfile", path.resolve("testdata/sentinel/B01.jp2"))
      .expect((res: supertest.Response) => {
        let composeImageFilesSavingDir: string = ApplicationContext.getComposeImageFilesSavingDir();
        let savingFilePath: string = composeImageFilesSavingDir + "B01.jp2";
        let fileState: fs.Stats = fs.statSync(savingFilePath);

        chai.expect(fileState.isFile()).to.equal(true);
      })
      .expect(200, done);
    });
  });
});
