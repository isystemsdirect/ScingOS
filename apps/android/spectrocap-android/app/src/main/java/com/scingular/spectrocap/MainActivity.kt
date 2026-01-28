package com.scingular.spectrocap

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.ScrollView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.scingular.spectrocap.clipboard.ClipboardReader
import com.scingular.spectrocap.device.DeviceIdentity
import com.scingular.spectrocap.device.DeviceRegistrar
import com.scingular.spectrocap.firebase.FirebaseClient
import com.scingular.spectrocap.lariCap.LariCapAdapter
import com.scingular.spectrocap.send.SpectrocapSender
import kotlinx.coroutines.launch

/**
 * Main Activity
 * 
 * SpectroCAP™ Phase 1 Android Client
 * Login + Device Registration + Send Clipboard Text
 */
class MainActivity : AppCompatActivity() {
    
    private lateinit var emailInput: EditText
    private lateinit var passwordInput: EditText
    private lateinit var loginButton: Button
    private lateinit var sendButton: Button
    private lateinit var logText: TextView
    private lateinit var scrollView: ScrollView
    
    private var currentUser: com.google.firebase.auth.FirebaseUser? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // Initialize UI elements
        emailInput = findViewById(R.id.emailInput)
        passwordInput = findViewById(R.id.passwordInput)
        loginButton = findViewById(R.id.loginButton)
        sendButton = findViewById(R.id.sendButton)
        logText = findViewById(R.id.logText)
        scrollView = findViewById(R.id.scrollView)
        
        // Disable send button initially
        sendButton.isEnabled = false
        
        // Setup listeners
        loginButton.setOnClickListener { handleLogin() }
        sendButton.setOnClickListener { handleSendClipboard() }
        
        // Check if already signed in
        currentUser = FirebaseClient.auth.currentUser
        if (currentUser != null) {
            onUserSignedIn()
        }
    }
    
    /**
     * Handle login
     */
    private fun handleLogin() {
        val email = emailInput.text.toString().trim()
        val password = passwordInput.text.toString().trim()
        
        if (email.isEmpty() || password.isEmpty()) {
            appendLog("Email and password required")
            return
        }
        
        appendLog("Signing in...")
        
        FirebaseClient.auth.signInWithEmailAndPassword(email, password)
            .addOnSuccessListener { authResult ->
                currentUser = authResult.user
                appendLog("✓ Signed in: ${currentUser?.email}")
                onUserSignedIn()
            }
            .addOnFailureListener { e ->
                appendLog("✗ Login failed: ${e.message}")
            }
    }
    
    /**
     * When user successfully signed in
     */
    private fun onUserSignedIn() {
        val uid = currentUser?.uid ?: return
        
        lifecycleScope.launch {
            try {
                // Get or create device ID
                val deviceId = DeviceIdentity.getOrCreateDeviceId(this@MainActivity)
                appendLog("Device ID: $deviceId")
                
                // Register device
                appendLog("Registering device...")
                val result = DeviceRegistrar.registerDevice(uid, deviceId)
                
                result.onSuccess {
                    appendLog("✓ Device registered at /users/$uid/devices/$deviceId")
                    emailInput.isEnabled = false
                    passwordInput.isEnabled = false
                    loginButton.isEnabled = false
                    sendButton.isEnabled = true
                }
                
                result.onFailure { e ->
                    appendLog("✗ Device registration failed: ${e.message}")
                }
            } catch (e: Exception) {
                appendLog("✗ Error: ${e.message}")
            }
        }
    }
    
    /**
     * Handle send clipboard text
     */
    private fun handleSendClipboard() {
        val uid = currentUser?.uid ?: return
        val clipboardText = ClipboardReader.readClipboardText(this)
        
        if (clipboardText.isNullOrBlank()) {
            appendLog("Clipboard is empty")
            return
        }
        
        appendLog("Clipboard: ${clipboardText.take(50)}...")
        appendLog("Sending...")
        
        lifecycleScope.launch {
            try {
                // Get device ID
                val deviceId = DeviceIdentity.getOrCreateDeviceId(this@MainActivity)
                
                // Apply LARI-CAP finalization
                val finalizedText = LariCapAdapter.finalizeCopy(clipboardText)
                
                // Check authorization
                val authorized = LariCapAdapter.authorizeIntent()
                if (!authorized) {
                    appendLog("✗ Authorization failed")
                    return@launch
                }
                
                // Send to Firebase
                val result = SpectrocapSender.sendClipboardText(uid, deviceId, finalizedText)
                
                result.onSuccess { messageId ->
                    appendLog("✓ Sent message: $messageId")
                    appendLog("  Storage: users/$uid/messages/$messageId.txt")
                    appendLog("  Firestore: /users/$uid/messages/$messageId")
                }
                
                result.onFailure { e ->
                    appendLog("✗ Send failed: ${e.message}")
                }
            } catch (e: Exception) {
                appendLog("✗ Error: ${e.message}")
            }
        }
    }
    
    /**
     * Append text to log display
     */
    private fun appendLog(message: String) {
        runOnUiThread {
            val timestamp = java.text.SimpleDateFormat("HH:mm:ss", java.util.Locale.US)
                .format(java.util.Date())
            logText.append("[$timestamp] $message\n")
            scrollView.post {
                scrollView.fullScroll(ScrollView.FOCUS_DOWN)
            }
        }
    }
}
