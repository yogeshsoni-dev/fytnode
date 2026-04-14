package com.fytnodes.feature.login.model

sealed interface LoginUiEffect {
    data class ShowMessage(val message: String) : LoginUiEffect
    data object NavigateToDashboard : LoginUiEffect
    data object NavigateToSignup : LoginUiEffect
}

