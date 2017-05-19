// Copyright 2017 huteng (huteng@gagogroup.com). All rights reserved.,
// Use of this source code is governed a license that can be found in the LICENSE file.

import *as fs from "fs";
import * as chai from "chai";

import {ApplicationContext} from "../../util/applicationcontext";
import {ImageComposeService} from "../../imagecompose/imagecomposeservice";


describe("ImageComposeService", () => {

  describe("test calcualte and export a new picture By Python", () => {
    it("test insert user's part of code into python template file", (done: MochaDone) => {
      let userInsertCode: string = `print("hello world")`;
      ImageComposeService.insertImageComposeCodeFromClient(userInsertCode).then((filePath: string) => {
        let fileTemplateContent: string = fs.readFileSync(filePath).toString();
        chai.expect(fileTemplateContent).to.equal(`print("hello world")\nprint("end")`);
        done();
      });
    });

    it("test use python export compose picture file ", () => {

    });
  });

  describe("test user's compose picture code file save", () => {
    let pythonCodeDir: string = ApplicationContext.getPythonFilesSavingDir();
    let fileName: string = pythonCodeDir + "testfile.py";

    before((done: MochaDone) => {
      if (fs.existsSync(fileName)) {
        fs.unlinkSync(fileName);
      }
      done();
    });

    it("test file save", (done: MochaDone) => {
      let userInsertCode: string = `print("hello world")`;
      ImageComposeService.saveClientOwnPythonCode(userInsertCode, "testfile.py").then(() => {

        let fileContent: string = fs.readFileSync(fileName).toString();

        chai.expect(fileContent).to.equal(`print("hello world")\nprint("end")`);
        done();
      });
    });
  });
});
