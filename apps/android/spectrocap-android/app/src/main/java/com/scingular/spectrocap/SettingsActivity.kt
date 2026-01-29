package com.scingular.spectrocap

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.preference.Preference
import androidx.preference.PreferenceFragmentCompat

/**
 * SettingsActivity: Official Settings screen with Material Design
 * - Host, Port, Endpoint configuration
 * - Transport options (HTTP on LAN toggle)
 * - Documents & Legal hub
 * - About information
 */
class SettingsActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)

        // Set action bar title
        supportActionBar?.title = "SpectroCAP(TM) Settings"
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        if (savedInstanceState == null) {
            supportFragmentManager
                .beginTransaction()
                .replace(R.id.settings, SettingsFragment())
                .commit()
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        finish()
        return true
    }

    class SettingsFragment : PreferenceFragmentCompat(), Preference.OnPreferenceClickListener {
        override fun onCreatePreferences(savedInstanceState: Bundle?, rootKey: String?) {
            setPreferencesFromResource(R.xml.root_preferences, rootKey)
            
            // Set click listeners for document preferences
            findPreference<Preference>("terms")?.onPreferenceClickListener = this
            findPreference<Preference>("privacy")?.onPreferenceClickListener = this
            findPreference<Preference>("licenses")?.onPreferenceClickListener = this
            findPreference<Preference>("versioning")?.onPreferenceClickListener = this
        }

        override fun onPreferenceClick(preference: Preference): Boolean {
            val intent = when (preference.key) {
                "terms" -> Intent(requireContext(), TermsActivity::class.java)
                "privacy" -> Intent(requireContext(), PrivacyActivity::class.java)
                "licenses" -> Intent(requireContext(), OssActivity::class.java)
                "versioning" -> Intent(requireContext(), VersioningActivity::class.java)
                else -> null
            }
            
            if (intent != null) {
                startActivity(intent)
                return true
            }
            return false
        }
    }
}
