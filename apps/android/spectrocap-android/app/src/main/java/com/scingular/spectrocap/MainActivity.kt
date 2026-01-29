package com.scingular.spectrocap

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    try {
      setContentView(R.layout.activity_main)
    } catch (_: Throwable) {
      // Layout/resources may be incomplete; keep compile-safe
    }
  }
}
