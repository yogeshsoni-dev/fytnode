package com.fytnodes.feature.profile.presentation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable

fun NavGraphBuilder.profileScreen(
    onLogout: () -> Unit,
) {
    composable(route = PROFILE_ROUTE) {
        ProfileRoute(onLogout = onLogout)
    }
}
