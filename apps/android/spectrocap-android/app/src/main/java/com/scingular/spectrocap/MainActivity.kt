package com.scingular.spectrocap

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.preference.PreferenceManager
import com.scingular.spectrocap.spectrocap.ClipboardSync
import com.scingular.spectrocap.spectrocap.ImageStore

/**
 * MainActivity: Premium UI with 2-mode controller for SpectroCAP
 * - Mode 1: Capture → take photo → save PNG locally → display filename
 * - Mode 2: Clipboard → import/copy/send to PC via /clip/push
 * - Settings moved to official SettingsActivity
 */
class MainActivity : AppCompatActivity() {

  private lateinit var statusText: TextView
  private lateinit var panelCapture: View
  private lateinit var panelClipboard: View

  private val requestCameraPermission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
    if (granted) {
      setStatus("Camera permission granted • Ready to capture")
    } else {
      setStatus("Camera permission denied • Cannot capture photos")
    }
  }

  // Capture mode
  private val takePreview = registerForActivityResult(ActivityResultContracts.TakePicturePreview()) { bmp: Bitmap? ->
    try {
      if (bmp == null) {
        setStatus("Capture cancelled.")
        return@registerForActivityResult
      }

      val previewImage = findViewById<ImageView>(R.id.previewImage)
      previewImage?.setImageBitmap(bmp)

      val file = ImageStore.savePng(this, bmp)
      setStatus("✓ Captured: ${file.name} (${file.length()} bytes)")
    } catch (e: Exception) {
      setStatus("Error saving image: ${e.message}")
    }
  }

  // ========== Helper Methods ==========

  private fun prefs() = PreferenceManager.getDefaultSharedPreferences(this)

  private fun getReceiverConfig(): String {
    val host = prefs().getString("receiver_host", "192.168.0.37") ?: "192.168.0.37"
    val port = prefs().getString("receiver_port", "8765") ?: "8765"
    val path = prefs().getString("endpoint_path", "/clip") ?: "/clip"
    val useHttps = prefs().getBoolean("use_https", false)
    val protocol = if (useHttps) "https" else "http"
    return "$protocol://$host:$port$path"
  }

  private fun setStatus(msg: String) {
    runOnUiThread {
      statusText.text = msg
    }
  }

  private fun showPanel(which: View) {
    panelCapture.visibility = if (which === panelCapture) View.VISIBLE else View.GONE
    panelClipboard.visibility = if (which === panelClipboard) View.VISIBLE else View.GONE
  }

  private fun getSystemClipboardText(): String {
    try {
      val cb = getSystemService(CLIPBOARD_SERVICE) as ClipboardManager
      val clip = cb.primaryClip ?: return ""
      if (clip.itemCount <= 0) return ""
      return clip.getItemAt(0).coerceToText(this).toString()
    } catch (e: Exception) {
      return ""
    }
  }

  private fun setSystemClipboardText(label: String, text: String) {
    try {
      val cb = getSystemService(CLIPBOARD_SERVICE) as ClipboardManager
      cb.setPrimaryClip(ClipData.newPlainText(label, text))
    } catch (e: Exception) {
      setStatus("Error copying to clipboard: ${e.message}")
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)

    // Cache views
    statusText = findViewById(R.id.statusText)
    panelCapture = findViewById(R.id.panelCapture)
    panelClipboard = findViewById(R.id.panelClipboard)

    // Default to Capture mode
    showPanel(panelCapture)
    setStatus("Welcome to SpectroCAP(TM)")

    // ========== Settings Button ==========
    findViewById<Button>(R.id.btnSettings).setOnClickListener {
      val intent = Intent(this, SettingsActivity::class.java)
      startActivity(intent)
    }

    // ========== Tab Navigation ==========
    findViewById<Button>(R.id.tabCapture).setOnClickListener {
      showPanel(panelCapture)
      setStatus("Capture mode")
    }

    findViewById<Button>(R.id.tabClipboard).setOnClickListener {
      showPanel(panelClipboard)
      setStatus("Clipboard mode")
    }

    // ========== CAPTURE MODE ==========
    findViewById<Button>(R.id.captureBtn).setOnClickListener {
      try {
        if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
          setStatus("Requesting camera permission...")
          requestCameraPermission.launch(android.Manifest.permission.CAMERA)
          return@setOnClickListener
        }
        setStatus("Opening camera...")
        takePreview.launch(null)
      } catch (e: Exception) {
        setStatus("Camera error: ${e.message}")
      }
    }

    // ========== CLIPBOARD MODE ==========

    // Import: Read system clipboard into clipEdit field
    findViewById<Button>(R.id.btnImportClip).setOnClickListener {
      try {
        val txt = getSystemClipboardText()
        val clipEdit = findViewById<EditText>(R.id.clipEdit)
        clipEdit.setText(txt)
        setStatus(if (txt.isEmpty()) "System clipboard empty" else "✓ Imported ${txt.length} chars")
      } catch (e: Exception) {
        setStatus("Import error: ${e.message}")
      }
    }

    // Copy: Write clipEdit field to system clipboard
    findViewById<Button>(R.id.btnCopyClip).setOnClickListener {
      try {
        val txt = findViewById<EditText>(R.id.clipEdit).text.toString()
        setSystemClipboardText("spectrocap", txt)
        setStatus(if (txt.isEmpty()) "Clipboard is empty" else "✓ Copied ${txt.length} chars to system")
      } catch (e: Exception) {
        setStatus("Copy error: ${e.message}")
      }
    }

    // Send: POST clipEdit to PC receiver /clip/push
    findViewById<Button>(R.id.btnSendToPc).setOnClickListener {
      val txt = findViewById<EditText>(R.id.clipEdit).text.toString()
      if (txt.isEmpty()) {
        setStatus("Clipboard field is empty")
        return@setOnClickListener
      }

      val config = getReceiverConfig()
      setStatus("Sending ${txt.length} chars to PC...")

      Thread {
        try {
          val result = ClipboardSync.push(config, txt)
          setStatus("✓ Sent to PC: $result")
        } catch (e: Exception) {
          setStatus("Send failed: ${e.message}")
        }
      }.start()
    }
  }
}
