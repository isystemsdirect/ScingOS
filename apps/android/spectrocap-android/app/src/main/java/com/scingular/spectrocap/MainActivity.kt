package com.scingular.spectrocap

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.scingular.spectrocap.ui.ThemedComposeView

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val composeView = findViewById<ThemedComposeView>(R.id.compose_view)
        composeView.setContent {
            // You can now use Compose UI here with your theme!
        }
    }
}
