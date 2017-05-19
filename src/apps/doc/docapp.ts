// Copyright 2017 huteng (huteng@gagogroup.com). All rights reserved.,
// Use of this source code is governed a license that can be found in the LICENSE file.

/**
 * The doc app hosts the "api.gagogroup.cn/docs/xx" for api documents.
 */

import * as express from "express";
import * as path from "path";
import * as Showdown from "showdown";
import * as fs from "fs";

import {ApplicationContext} from "../../util/applicationcontext";

const baseUrl: string = ApplicationContext.baseUrl();

const app: express.Application = express();

const docsDir: string = path.resolve(`${__dirname}/../../../public/docs`);
app.use("/references", express.static(docsDir));

const data: any = {
  apiRefUrl: `${baseUrl}/docs/references`
};

app.get("/", (req: express.Request, res: express.Response) => {
  res.render("index", data);
});

module.exports = app;
