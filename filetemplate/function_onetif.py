#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Copyright (c) 2017 ChuiZi <wqc dot 0722 at gmail dot com>. All rights reserved.

import numpy as np
from osgeo import gdal
import sys

class ShitConfig(object):
    def __init__(self, a, b):
        self.a = a
        self.b = b


class Shit(object):
    def __init__(self, file01, file02, file03):

        self.driver = gdal.GetDriverByName("PNG")
        self.mem_driver = gdal.GetDriverByName("MEM")

        self.ds01 = self.open_as_dataset(file01)
        self.ds02 = self.open_as_dataset(file02)
        self.ds03 = self.open_as_dataset(file03)

        self.x_size, self.y_size = self.get_metadata(self.ds01, self.ds02, self.ds03)

    @staticmethod
    def get_metadata(ds01: gdal.Dataset, ds02: gdal.Dataset, ds03: gdal.Dataset):
        x_size = ds01.RasterXSize if ds01.RasterXSize == ds02.RasterXSize == ds03.RasterXSize else None
        y_size = ds01.RasterYSize if ds01.RasterYSize == ds02.RasterYSize == ds03.RasterYSize else None

        if x_size and y_size:
            return x_size, y_size
        else:
            raise ValueError

    @staticmethod
    def open_as_dataset(file):
        return gdal.Open(file, gdal.GA_ReadOnly)

    @staticmethod
    def read_as_array(ds: gdal.Dataset):
        return ds.ReadAsArray()

    def render_to_png(self, dst, config):
        mem_ds = self.mem_driver.Create(
            "",
            self.x_size,
            self.y_size,
            4,
            gdal.GDT_UInt16
        )

        b01 = self.read_as_array(self.ds01)
        b02 = self.read_as_array(self.ds02)
        b03 = self.read_as_array(self.ds03)
        mask = self.get_alpha_mask(b01, b02, b03)
        b01_stretched = self.apply_mask(self.idiot_stretch(b01, config.a, config.b), mask)
        b02_stretched = self.apply_mask(self.idiot_stretch(b02, config.a, config.b), mask)
        b03_stretched = self.apply_mask(self.idiot_stretch(b03, config.a, config.b), mask)
        self.write_array([b01_stretched, b02_stretched, b03_stretched, mask * 255], mem_ds)
        out_ds = self.driver.CreateCopy(dst, mem_ds, 0)
        del out_ds
        del mem_ds

    @staticmethod
    def write_array(arr_list, dst_ds):
        for i in range(0, len(arr_list)):
            rb = dst_ds.GetRasterBand(i + 1)
            rb.WriteArray(arr_list[i], 0, 0)
            rb.FlushCache()

    @staticmethod
    def get_alpha_mask(b1: np.ndarray, b2: np.ndarray, b3: np.ndarray):
        mask = np.logical_or(b1 > 0, b2 > 0, b3 > 0)
        return mask

    def idiot_stretch(self, arr, a, b):
        return (a * arr + b).astype('uint16')

    def apply_mask(self, arr, mask):
        return np.choose(mask, (np.zeros([self.x_size, self.y_size]), arr))


sc = ShitConfig(a=0.0219, b=-1.3)

shit = Shit(*sys.argv[1:4])
shit.render_to_png(sys.argv[4], sc)