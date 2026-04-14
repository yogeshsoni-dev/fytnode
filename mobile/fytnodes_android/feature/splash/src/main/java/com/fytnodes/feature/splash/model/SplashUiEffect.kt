package com.fytnodes.feature.splash.model

sealed interface SplashUiEffect {
    data object NavigateToOnboarding : SplashUiEffect
    data object NavigateToDashboard : SplashUiEffect
}

