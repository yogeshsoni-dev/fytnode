package com.fytnodes.feature.login.model

sealed interface LoginUiEvent {
    data class OnEmailChanged(val value: String) : LoginUiEvent
    data class OnPasswordChanged(val value: String) : LoginUiEvent
    data object Submit : LoginUiEvent
    data object NavigateToSignupClick : LoginUiEvent
}

