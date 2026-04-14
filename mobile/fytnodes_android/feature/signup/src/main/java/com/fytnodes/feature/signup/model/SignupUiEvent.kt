package com.fytnodes.feature.signup.model

sealed interface SignupUiEvent {
    data class OnNameChanged(val value: String) : SignupUiEvent
    data class OnEmailChanged(val value: String) : SignupUiEvent
    data class OnPasswordChanged(val value: String) : SignupUiEvent
    data object Submit : SignupUiEvent
    data object NavigateBackClick : SignupUiEvent
}

