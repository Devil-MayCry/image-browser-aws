高分数据下载

===
1. 使用说明
---
脚本：reTif.py。 

import reTif
reTif.reTifFun(input_path, out_path, class_pix)

:param input_path: 图片输入路径
:param out_path: 图片输出路径
:param class_pix：根据pix预值进行分类[0.1,0.4,0.5]划分为四类（min_value, <=0.1),(0.1<, <=0.4),(0.4<, <=0.5),(0.5<,<=max_value)
:return: 无返回，如果执行成功，看到输出的tiff文件


2.运行环境
---
ubuntu 系统 Python3
依赖包: gdal, numpy, osgeo, pandas, gdalconst