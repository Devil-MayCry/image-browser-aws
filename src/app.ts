// Copyright 2017 huteng (huteng@gagogroup.com). All rights reserved.,
// Use of this source code is governed a license that can be found in the LICENSE file.

import * as express from "express";

const app: express.Application = express();

let betaRouter: express.Router = require("./routes/beta");
app.use("/api/beta", betaRouter);

app.listen(3000);

