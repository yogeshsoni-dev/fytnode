package com.fytnodes.feature.login

import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable

const val LOGIN_ROUTE = "login_route"

sealed interface LoginNavigation {
    data object Signup : LoginNavigation
    data object Dashboard : LoginNavigation
}

fun NavGraphBuilder.loginScreen(
    onNavigationEvent: (LoginNavigation) -> Unit,
) {
    composable(route = LOGIN_ROUTE) {
        LoginRoute(
            onNavigateToSignup = { onNavigationEvent(LoginNavigation.Signup) },
            onNavigateToDashboard = { onNavigationEvent(LoginNavigation.Dashboard) },
        )
    }
}

