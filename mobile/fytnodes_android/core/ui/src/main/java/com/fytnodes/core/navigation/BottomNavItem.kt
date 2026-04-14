package com.fytnodes.core.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.ui.graphics.vector.ImageVector

sealed class BottomNavItem(
    val route: String,
    val icon: ImageVector,
) {
    data object Home : BottomNavItem(route = "home", icon = Icons.Default.Home)
    data object Activity : BottomNavItem(route = "territory", icon = Icons.Default.TrendingUp)
    data object Community : BottomNavItem(route = "community", icon = Icons.Default.Groups)
    data object Profile : BottomNavItem(route = "profile", icon = Icons.Default.Person)
}

val bottomNavItems = listOf(
    BottomNavItem.Home,
    BottomNavItem.Activity,
    BottomNavItem.Community,
    BottomNavItem.Profile,
)
