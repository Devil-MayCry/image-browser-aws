#!/usr/bin/env python3.5
# -*- coding: utf-8 -*-
# gdal-2.1.1及以上版本
import gdal
from osgeo import gdal
import os, sys, glob



def merge_tif(band_R_tif,band_G_tif,band_B_tif,output_filename):
    '''
    :param band_R_tif: 最上层tif图像的绝对路径，e.g.('/Users/luqikun/Documents/input1.tif')
    :param band_G_tif: 中间层tif图像的绝对路径,e.g.('/Users/luqikun/Documents/input2.tif')
    :param band_B_tif: 最下层tif图像的绝对路径,e.g.('/Users/luqikun/Documents/input3.tif')
    :param output_filename: 波段融合之后得到的tif图像的绝对路径，e.g.('/Users/luqikun/Documents/output.png')
    :return:
    '''

    whole_bandname = ['B01','B02','B03','B04','B05','BO6','B07','B08','B09','B10','B11','B12','B8A','TCI']
    tmp_tif = output_filename.rstrip('.png') + '.tif'
    # 方式二：合成文件格式是tif的实体文件
    os.system('gdal_merge.py -o %s -separate  %s %s %s' % (tmp_tif, band_R_tif, band_G_tif, band_B_tif))
    os.system('gdal_translate -of PNG %s %s' % (tmp_tif, output_filename))
    os.system('rm %s' % (tmp_tif))

def main():
    merge_tif(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])

if __name__ == '__main__':
    main()


