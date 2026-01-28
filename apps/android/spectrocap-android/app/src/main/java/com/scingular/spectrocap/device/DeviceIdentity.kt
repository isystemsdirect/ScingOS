package com.scingular.spectrocap.device

import android.content.Context
import java.util.UUID

/**
 * Device Identity Manager
 * 
 * Generates and persists device ID using SharedPreferences
 * SpectroCAP™ Phase 1 — Android Kotlin Client
 */
object DeviceIdentity {
    private const val PREFS_NAME = "com.scingular.spectrocap.device"
    private const val KEY_DEVICE_ID = "spectrocap.deviceId"
    
    /**
     * Get or create device ID
     * Generated once per device using UUID; persisted in SharedPreferences
     */
    fun getOrCreateDeviceId(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        var deviceId = prefs.getString(KEY_DEVICE_ID, null)
        
        if (deviceId == null) {
            deviceId = UUID.randomUUID().toString()
            prefs.edit().putString(KEY_DEVICE_ID, deviceId).apply()
        }
        
        return deviceId
    }
    
    /**
     * Device metadata
     */
    data class DeviceInfo(
        val deviceId: String,
        val name: String = "Android Client",
        val platform: String = "android"
    )
}
