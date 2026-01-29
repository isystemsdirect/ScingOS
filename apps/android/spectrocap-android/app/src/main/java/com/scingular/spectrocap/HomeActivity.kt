package com.scingular.spectrocap

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.scingular.spectrocap.ui.nav.AppScaffold
import com.scingular.spectrocap.ui.theme.IonMetalTheme

/**
 * HomeActivity: Compose root per IonMetal CB
 */
class HomeActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContent {
      IonMetalTheme {
        AppScaffold()
      }
    }
  }
}
