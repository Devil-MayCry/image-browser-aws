// Copyright 2017 huteng (huteng@gagogroup.com). All rights reserved.,
// Use of this source code is governed a license that can be found in the LICENSE file.

import * as express from "express";

import {ApplicationContext} from "./util/applicationcontext";

const app: express.Application = express();

let betaRouter: express.Router = require("./routes/beta");

// beta route
app.use("/api/beta", betaRouter);

// show project api docs
app.use("/docs", require("./apps/doc/docapp"));

app.use("/", express.static(ApplicationContext.getImageBrowserDistPath()));
app.get("/*", (req: express.Request, res: express.Response) => {
  res.sendFile(`${ApplicationContext.getImageBrowserDistPath()}/index.html`);
});

app.listen(3000);

