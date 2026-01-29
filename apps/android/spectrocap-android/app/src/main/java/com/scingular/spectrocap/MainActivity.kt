package com.scingular.spectrocap

import android.graphics.Bitmap
import android.os.Bundle
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.scingular.spectrocap.spectrocap.ImageStore

class MainActivity : AppCompatActivity() {

  private val takePreview = registerForActivityResult(ActivityResultContracts.TakePicturePreview()) { bmp: Bitmap? ->
    if (bmp == null) {
      findViewById<TextView>(R.id.statusText)?.text = "Capture cancelled."
      return@registerForActivityResult
    }

    findViewById<ImageView>(R.id.previewImage)?.setImageBitmap(bmp)

    val f = ImageStore.savePng(this, bmp)
    findViewById<TextView>(R.id.statusText)?.text = "Saved: ${f.name} (${f.length()} bytes)"
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)

    findViewById<Button>(R.id.captureBtn)?.setOnClickListener {
      findViewById<TextView>(R.id.statusText)?.text = "Opening camera..."
      takePreview.launch(null)
    }
  }
}
