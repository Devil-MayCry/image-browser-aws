# OVERVIEW

该工程为实现多波段图片实时合成（image-browser项目）后端接口工程

该工程从aws 的bucket上读取tiff图片（单波段图片），通过调用python脚本进行波段合成

tiff图片由aws-tiff-parser(https://github.com/Devil-MayCry/aws-tiff-parser)进行生产

# 构建

该工程采用nodejs开发，Typescript编写

1. 安装 node.js 6.11.0 以及 npm，Typescript
2. 安装redis
3. 安装gdal

或者用打包好环境的docker镜像
docker pull huteng/cent7:gdal 

# 配置环境

## NODE_ENV
`NODE_ENV` 在本地需要设置为`development`，在生产服务器为`production`

# LINT

`sh ./bin/tslint.sh`

# GULP

1. `gulp ts` 将会把 TypeScript 编译成 JavaScript 到 `./dist` 文件夹.
2. `gulp server` 将启动 `./dist/app.js`.

# 部署服务器

工程采用Docker方式部署

镜像采用了基于centos7，预先安装了nodejs, npm, pm2 等

可以通过
docker pull huteng/cent7:gdal 
获取镜像

启动时将工程挂载进镜像部署

运行bin/start_docker_service.sh脚本

# BUILD API DOC

We use [API Blueprint](https://apiblueprint.org/) to write docs.
Run `sh ./bin/gen_api_docs.sh` to generate html document under `./public/docs` folder ([aglio](https://github.com/danielgtaylor/aglio) is required).
