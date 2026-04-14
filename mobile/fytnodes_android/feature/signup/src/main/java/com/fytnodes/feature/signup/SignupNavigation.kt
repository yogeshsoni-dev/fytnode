package com.fytnodes.feature.signup

import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable

const val SIGNUP_ROUTE = "signup_route"

sealed interface SignupNavigation {
    data object Login : SignupNavigation
    data object Back : SignupNavigation
}

fun NavGraphBuilder.signupScreen(
    onNavigationEvent: (SignupNavigation) -> Unit,
) {
    composable(route = SIGNUP_ROUTE) {
        SignupRoute(
            onNavigateToLogin = { onNavigationEvent(SignupNavigation.Login) },
            onNavigateBack = { onNavigationEvent(SignupNavigation.Back) },
        )
    }
}

