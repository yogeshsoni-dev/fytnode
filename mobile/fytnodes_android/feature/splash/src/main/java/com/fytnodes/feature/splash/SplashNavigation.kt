package com.fytnodes.feature.splash

import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable

const val SPLASH_ROUTE = "splash_route"

sealed interface SplashNavigation {
    data object Onboarding : SplashNavigation
    data object Dashboard : SplashNavigation
}

fun NavGraphBuilder.splashScreen(
    onNavigationEvent: (SplashNavigation) -> Unit,
) {
    composable(route = SPLASH_ROUTE) {
        SplashRoute(
            onNavigateToOnboarding = { onNavigationEvent(SplashNavigation.Onboarding) },
            onNavigateToDashboard = { onNavigationEvent(SplashNavigation.Dashboard) },
        )
    }
}

