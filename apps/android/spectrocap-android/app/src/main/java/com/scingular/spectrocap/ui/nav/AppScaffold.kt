package com.scingular.spectrocap.ui.nav

import androidx.compose.foundation.layout.RowScope
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.scingular.spectrocap.ui.screens.HomeScreen
import com.scingular.spectrocap.ui.screens.LegalScreen
import com.scingular.spectrocap.ui.screens.SettingsScreen

@Composable
fun AppScaffold() {
    val nav = rememberNavController()

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        bottomBar = { IonBottomBar(nav) }
    ) { _ ->
        NavHost(
            navController = nav,
            startDestination = Dest.Home.route
        ) {
            composable(Dest.Home.route) { HomeScreen(onOpenSettings = { nav.navigate(Dest.Settings.route) }) }
            composable(Dest.Settings.route) {
                SettingsScreen(
                    onOpenLegal = { nav.navigate(Dest.Legal.route) },
                    onBack = { nav.popBackStack() }
                )
            }
            composable(Dest.Legal.route) { LegalScreen(onBack = { nav.popBackStack() }) }
        }
    }
}

@Composable
private fun IonBottomBar(nav: NavHostController) {
    val backStack by nav.currentBackStackEntryAsState()
    val route = backStack?.destination?.route

    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surface,
        tonalElevation = 0.dp
    ) {
        IonBottomItem(
            label = "Home",
            selected = route == Dest.Home.route,
            onClick = {
                nav.navigate(Dest.Home.route) {
                    popUpTo(Dest.Home.route) { inclusive = true }
                }
            }
        )
        IonBottomItem(
            label = "Settings",
            selected = route == Dest.Settings.route,
            onClick = { nav.navigate(Dest.Settings.route) }
        )
    }
}

@Composable
private fun RowScope.IonBottomItem(label: String, selected: Boolean, onClick: () -> Unit) {
    NavigationBarItem(
        selected = selected,
        onClick = onClick,
        icon = { /* Intentionally empty: IonMetal = no clutter */ },
        label = { Text(label) },
        colors = NavigationBarItemDefaults.colors(
            selectedTextColor = MaterialTheme.colorScheme.onSurface,
            unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant,
            indicatorColor = MaterialTheme.colorScheme.surface
        )
    )
}
