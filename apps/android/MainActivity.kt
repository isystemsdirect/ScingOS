package com.isystemsdirect.scingremotepaste

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.isystemsdirect.scingremotepaste.ui.screens.LoginScreen
import com.isystemsdirect.scingremotepaste.ui.screens.MainScreen
import com.isystemsdirect.scingremotepaste.ui.theme.ScingRemotePasteTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ScingRemotePasteTheme {
                Surface(color = MaterialTheme.colorScheme.background) {
                    RemotePasteApp()
                }
            }
        }
    }
}

@Composable
fun RemotePasteApp() {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = "login") {
        composable("login") {
            LoginScreen(onLoginSuccess = {
                navController.navigate("main") {
                    popUpTo("login") { inclusive = true }
                }
            })
        }
        composable("main") {
            MainScreen(onLogout = {
                navController.navigate("login") {
                    popUpTo("main") { inclusive = true }
                }
            })
        }
    }
}
