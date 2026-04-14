package com.fytnodes.feature.onboarding.presentation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable

const val ONBOARDING_ROUTE = "onboarding_route"

sealed interface OnboardingNavigation {
    data object Login : OnboardingNavigation
}

fun NavGraphBuilder.onboardingScreen(
    onNavigationEvent: (OnboardingNavigation) -> Unit,
) {
    composable(route = ONBOARDING_ROUTE) {
        OnboardingRoute(
            onComplete = { onNavigationEvent(OnboardingNavigation.Login) },
        )
    }
}

