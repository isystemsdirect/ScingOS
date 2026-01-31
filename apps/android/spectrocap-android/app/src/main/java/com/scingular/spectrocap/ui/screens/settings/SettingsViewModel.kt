package com.scingular.spectrocap.ui.screens.settings

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.scingular.spectrocap.data.AppSettings
import com.scingular.spectrocap.data.SettingsRepository
import com.scingular.spectrocap.data.dataStore
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class SettingsViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = SettingsRepository(application.applicationContext)

    val settingsState: StateFlow<AppSettings?> = repository.settingsFlow.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = null
    )

    fun setAutoDiscoverReceiver(value: Boolean) = viewModelScope.launch {
        repository.setAutoDiscoverReceiver(value)
    }

    fun setReceiverIp(value: String) = viewModelScope.launch {
        repository.setReceiverIp(value)
    }

    fun setReceiverPort(value: String) = viewModelScope.launch {
        repository.setReceiverPort(value)
    }

     fun setVerboseLogging(value: Boolean) = viewModelScope.launch {
        repository.setVerboseLogging(value)
    }

    fun setNetworkTimeoutMs(value: Int) = viewModelScope.launch {
        repository.setNetworkTimeoutMs(value)
    }

    fun setNetworkRetryAttempts(value: Int) = viewModelScope.launch {
        repository.setNetworkRetryAttempts(value)
    }

    fun setAutoSendClipboard(value: Boolean) = viewModelScope.launch {
        repository.setAutoSendClipboard(value)
    }

    fun setConfirmBeforeSend(value: Boolean) = viewModelScope.launch {
        repository.setConfirmBeforeSend(value)
    }

    fun setClearClipboardAfterSend(value: Boolean) = viewModelScope.launch {
        repository.setClearClipboardAfterSend(value)
    }
}
