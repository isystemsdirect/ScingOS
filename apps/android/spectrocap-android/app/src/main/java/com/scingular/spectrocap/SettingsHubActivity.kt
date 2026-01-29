package com.scingular.spectrocap

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

/**
 * SettingsHubActivity: Card-based settings hub per IonMetal CB.
 * Delegates to existing SettingsActivity (preferences) and other activities.
 */
class SettingsHubActivity : AppCompatActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_settings_hub)

    // Receiver Configuration → open preferences screen
    findViewById<Button>(R.id.btnEditConfiguration).setOnClickListener {
      startActivity(Intent(this, SettingsActivity::class.java))
    }

    // Documents & Legal
    findViewById<Button>(R.id.btnTerms).setOnClickListener {
      startActivity(Intent(this, TermsActivity::class.java))
    }
    findViewById<Button>(R.id.btnPrivacy).setOnClickListener {
      startActivity(Intent(this, PrivacyActivity::class.java))
    }
    findViewById<Button>(R.id.btnLicenses).setOnClickListener {
      startActivity(Intent(this, OssActivity::class.java))
    }

    // About → Versioning
    findViewById<Button>(R.id.btnVersioning).setOnClickListener {
      startActivity(Intent(this, VersioningActivity::class.java))
    }
  }
}
