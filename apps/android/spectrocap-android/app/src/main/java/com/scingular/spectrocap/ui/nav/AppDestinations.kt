package com.scingular.spectrocap.ui.nav

sealed class Dest(val route: String) {
    data object Home : Dest("home")
    data object Settings : Dest("settings")
    data object Legal : Dest("legal")
}
