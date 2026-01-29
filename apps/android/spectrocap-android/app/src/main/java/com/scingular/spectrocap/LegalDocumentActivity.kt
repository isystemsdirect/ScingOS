package com.scingular.spectrocap

import android.content.Context
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import android.widget.ScrollView
import android.widget.TextView
import java.io.InputStream

/**
 * Generic Legal Document Viewer Activity
 * Loads and displays markdown/text files from assets/legal/
 */
open class LegalDocumentActivity : AppCompatActivity() {

    protected open val documentFileName: String = ""
    protected open val titleResId: Int = R.string.about_title

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_legal_document)

        // Set action bar title
        supportActionBar?.title = getString(titleResId)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        // Load and display document
        if (documentFileName.isNotEmpty()) {
            loadDocument(documentFileName)
        }
    }

    private fun loadDocument(fileName: String) {
        try {
            val content = readAsset("legal/$fileName")
            val docTextView = findViewById<TextView>(R.id.documentText)
            docTextView.text = content
        } catch (e: Exception) {
            val docTextView = findViewById<TextView>(R.id.documentText)
            docTextView.text = "Error loading document: ${e.message}"
        }
    }

    private fun readAsset(path: String): String {
        return try {
            val inputStream: InputStream = assets.open(path)
            inputStream.bufferedReader().use { it.readText() }
        } catch (e: Exception) {
            "Unable to load file: $path\n\n${e.message}"
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        finish()
        return true
    }
}

class TermsActivity : LegalDocumentActivity() {
    override val documentFileName = "TERMS_OF_USE.md"
    override val titleResId = R.string.terms_title
}

class PrivacyActivity : LegalDocumentActivity() {
    override val documentFileName = "PRIVACY_POLICY.md"
    override val titleResId = R.string.privacy_title
}

class OssActivity : LegalDocumentActivity() {
    override val documentFileName = "OSS_NOTICES.md"
    override val titleResId = R.string.licenses_title
}
