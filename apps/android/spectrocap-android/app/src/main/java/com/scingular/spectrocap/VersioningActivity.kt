package com.scingular.spectrocap

import android.os.Build
import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

/**
 * VersioningActivity: Display app version, build info, and package details
 */
class VersioningActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_versioning)

        // Set action bar
        supportActionBar?.title = getString(R.string.versioning_title)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        // Populate version info
        displayVersionInfo()
    }

    private fun displayVersionInfo() {
        val appNameText = findViewById<TextView>(R.id.appNameValue)
        val versionNameText = findViewById<TextView>(R.id.versionNameValue)
        val versionCodeText = findViewById<TextView>(R.id.versionCodeValue)
        val buildTypeText = findViewById<TextView>(R.id.buildTypeValue)
        val packageNameText = findViewById<TextView>(R.id.packageNameValue)
        val osVersionText = findViewById<TextView>(R.id.osVersionValue)
        val deviceText = findViewById<TextView>(R.id.deviceValue)

        // App Name
        appNameText.text = getString(R.string.app_name)

        // Version Name & Code - Using fallback values
        versionNameText.text = "1.0.0"
        versionCodeText.text = "1"
        buildTypeText.text = "Debug"
        packageNameText.text = packageName

        // OS Version
        osVersionText.text = "Android ${Build.VERSION.RELEASE} (API ${Build.VERSION.SDK_INT})"

        // Device Model
        deviceText.text = "${Build.MANUFACTURER} ${Build.MODEL}"
    }

    override fun onSupportNavigateUp(): Boolean {
        finish()
        return true
    }
}
