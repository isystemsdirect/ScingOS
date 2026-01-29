package com.scingular.spectrocap

import android.graphics.Bitmap
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.scingular.spectrocap.spectrocap.ImageStore
import com.scingular.spectrocap.spectrocap.SendQueue
import com.scingular.spectrocap.spectrocap.Sender

class MainActivity : AppCompatActivity() {

  private val prefs by lazy { getSharedPreferences("spectrocap_prefs", MODE_PRIVATE) }

  private fun updateCounters() {
    val (q, s, f) = SendQueue.counts(this)
    findViewById<TextView>(R.id.countersText)?.text = "Queued: $q | Sent: $s | Failed: $f"
  }

  private fun getEndpointFromUIOrPrefs(): String {
    val et = findViewById<EditText>(R.id.endpointText)
    val ui = et?.text?.toString()?.trim().orEmpty()
    if (ui.isNotEmpty()) return ui
    return prefs.getString("endpoint", Sender.defaultEndpoint()) ?: Sender.defaultEndpoint()
  }

  private fun persistEndpoint(endpoint: String) {
    prefs.edit().putString("endpoint", endpoint).apply()
  }

  private val takePreview = registerForActivityResult(ActivityResultContracts.TakePicturePreview()) { bmp: Bitmap? ->
    if (bmp == null) {
      findViewById<TextView>(R.id.statusText)?.text = "Capture cancelled."
      return@registerForActivityResult
    }

    findViewById<ImageView>(R.id.previewImage)?.setImageBitmap(bmp)

    val f = ImageStore.savePng(this, bmp)
    SendQueue.enqueueFile(this, f.absolutePath)

    findViewById<TextView>(R.id.statusText)?.text = "Saved + queued: ${f.name} (${f.length()} bytes)"
    updateCounters()
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)

    // Seed endpoint field
    val seed = prefs.getString("endpoint", Sender.defaultEndpoint()) ?: Sender.defaultEndpoint()
    findViewById<EditText>(R.id.endpointText)?.setText(seed)

    updateCounters()

    findViewById<Button>(R.id.captureBtn)?.setOnClickListener {
      findViewById<TextView>(R.id.statusText)?.text = "Opening camera..."
      takePreview.launch(null)
    }

    findViewById<Button>(R.id.sendNowBtn)?.setOnClickListener {
      val endpoint = getEndpointFromUIOrPrefs()
      persistEndpoint(endpoint)

      findViewById<TextView>(R.id.statusText)?.text = "Sending queued items..."
      Thread {
        val (sentNow, failedNow) = Sender.sendAllQueued(this, endpoint)
        runOnUiThread {
          updateCounters()
          findViewById<TextView>(R.id.statusText)?.text =
            "Send complete. Sent: $sentNow | Failed: $failedNow (endpoint: $endpoint)"
        }
      }.start()
    }
  }
}
