package com.scingular.spectrocap.spectrocap

import android.content.Context
import android.graphics.Bitmap
import java.io.File
import java.io.FileOutputStream

object ImageStore {
  fun savePng(context: Context, bitmap: Bitmap): File {
    val dir = File(context.filesDir, "captures").apply { mkdirs() }
    val file = File(dir, "capture_${System.currentTimeMillis()}.png")
    FileOutputStream(file).use { out ->
      bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
      out.flush()
    }
    return file
  }
}
