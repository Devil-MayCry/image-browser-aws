#!/usr/bin/env python3.5
# -*- coding: utf-8 -*-

import os
import glob
import gdal
import sys
import time
import numpy as np
import pandas as pd

from osgeo import osr
from gdalconst import GA_ReadOnly, GDT_Float32

class ReTifClass(object):

	def reclass_zj_fun(self, input_filename, class_pix):
		'''
		根据阈值进行分类
		:param input_filename: 需要读入的tif文件（带路径）
		:param class_pix: 用于分类的特征值所构成的list
		:return: dataframe数据结构，完成重分类之后的结果
		'''

		# 使用gdal读进文件，成为python的numpy的arrary数组形式
		test1 = gdal.Open(input_filename, GA_ReadOnly)
		test1band = test1.GetRasterBand(1)
		test1Data = test1band.ReadAsArray()

		df_use_for_class = pd.DataFrame(test1Data.astype(float), dtype='float32')

		# 考虑到数量过大，可能因内存过小引出问题，可以采用import time，引用sleep方法，缓停2秒，
		time.sleep(2)

		max_pix = df_use_for_class.max(numeric_only=True).max()

		# ${xxx}
		#
		df_use_for_class[df_use_for_class <= class_pix[0]] = 1

		i = 1
		while i < len(class_pix):
			df_use_for_class[(df_use_for_class > class_pix[i-1])
							 & (df_use_for_class <= class_pix[i])] = i+1
			i += 1
		df_use_for_class[(df_use_for_class > class_pix[2]) & (
			df_use_for_class <= max_pix)] = len(class_pix)+1
		#df_use_for_class[(df_use_for_class > class_pix[0]) & (df_use_for_class <= class_pix[1])] = 2
		#df_use_for_class[(df_use_for_class > class_pix[1]) & (df_use_for_class <= class_pix[2])] = 3
		#df_use_for_class[(df_use_for_class > class_pix[2]) & (df_use_for_class <= max_pix)] = 4
		return df_use_for_class


	def export_to_tif_fun(self, input_filename, class_final_df, otNDVI_class_filename):
		'''
		将重分类好的结果，输出成tif
		:param input_filename: 需要读入的tif文件（带路径）
		:param class_final_df: 已经完成重新分类得到的dataframe数据，需调用reclass_zj_fun函数
		:param otNDVI_class_filename: tiff重分类完成之后，输出的文件名（包括路径）
		:return: 无返回，如果执行成功，看到输出的tiff文件
		'''

		# 使用gdal读进文件，成为python的numpy的arrary数组形式
		input_tif = gdal.Open(input_filename, GA_ReadOnly)
		driver = input_tif.GetDriver()
		rXSize = input_tif.RasterXSize
		rYSize = input_tif.RasterYSize
		input_tifGeotrans = input_tif.GetGeoTransform()
		input_tifProj = input_tif.GetProjectionRef()
		input_tifband = input_tif.GetRasterBand(1)
		input_tifData = input_tifband.ReadAsArray()

		#otNDVI_class_filename = os.path.join(otNDVI_class_dir,source_filename)

		otDataset = driver.Create(otNDVI_class_filename,
								  rXSize, rYSize, 1, GDT_Float32)
		otDataset.SetGeoTransform(input_tifGeotrans)
		otDataset.SetProjection(input_tifProj)

		outBand = otDataset.GetRasterBand(1)
		outBand.WriteArray(np.array(class_final_df), 0, 0)
		outBand.FlushCache()
		outBand = None


def reTifFun(input_path, out_path, class_pix):
	'''
	:param input_path: 图片输入路径
	:param out_path: 图片输出路径
	:param class_pix：根据pix预值进行分类
	:return: 无返回，如果执行成功，看到输出的tiff文件
	'''
	reTifClass = ReTifClass()
	input_path_files = glob.glob(input_path + "/*.tiff")
	input_path_files += glob.glob(input_path + "/*.tif")
	for input_path_file in input_path_files:

		out_path_file_name = input_path_file.split("/")[-1]

		out_path_file = os.path.join(out_path, out_path_file_name)

		df_use_for_class = reTifClass.reclass_zj_fun(input_path_file, class_pix)
		reTifClass.export_to_tif_fun(input_path_file, df_use_for_class, out_path_file)


if __name__ == "__main__":
	class_pix = [0.01, 0.4, 0.5]
	input_path = os.getcwd()
	out_path = os.getcwd()
	reTifFun(input_path, out_path, class_pix)
