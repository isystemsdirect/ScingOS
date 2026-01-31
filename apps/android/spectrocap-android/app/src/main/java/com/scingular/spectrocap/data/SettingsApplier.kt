package com.scingular.spectrocap.data

import android.content.Context
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach

class SettingsApplier(
    private val context: Context, // For accessing other services
    private val settingsRepository: SettingsRepository,
    private val appScope: CoroutineScope
) {

    fun beginObserving() {
        settingsRepository.settingsFlow
            .distinctUntilChanged()
            .onEach { settings -> apply(settings) }
            .launchIn(appScope)
    }

    private fun apply(settings: AppSettings) {
        // This is the centralized "apply layer".
        // In a real app, you would inject service dependencies here
        // (e.g., NetworkClient, ClipboardManager) and call their
        // configuration methods.

        // Example of an observable side effect:
        // val networkClient = (context.applicationContext as MyApplication).networkClient
        // networkClient.setTimeout(settings.networkTimeoutMs)
        // networkClient.setRetryAttempts(settings.networkRetryAttempts)

        // You can log the application of settings for debug traceability
        println("SETTINGS APPLIED: $settings")
    }
}
