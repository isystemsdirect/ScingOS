package com.scingular.spectrocap

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import com.scingular.spectrocap.ui.theme.SpectroCAPTheme
import java.io.InputStream

open class LegalDocumentActivity : ComponentActivity() {

    protected open val documentFileName: String = ""
    protected open val titleResId: Int = R.string.app_name

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SpectroCAPTheme {
                LegalDocumentScreen(
                    title = getString(titleResId),
                    fileName = documentFileName,
                    onBack = { finish() }
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LegalDocumentScreen(title: String, fileName: String, onBack: () -> Unit) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()

    fun readAsset(path: String): String {
        return try {
            val inputStream: InputStream = context.assets.open(path)
            inputStream.bufferedReader().use { it.readText() }
        } catch (e: Exception) {
            "Unable to load file: $path\n\n${e.message}"
        }
    }

    val content = readAsset("legal/$fileName")

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(title) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Text(
            text = content,
            modifier = Modifier
                .padding(padding)
                .verticalScroll(scrollState)
        )
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
