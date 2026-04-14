package com.fytnodes.feature.signup.model

sealed interface SignupUiEffect {
    data class ShowMessage(val message: String) : SignupUiEffect
    data object NavigateToLogin : SignupUiEffect
    data object NavigateBack : SignupUiEffect
}

