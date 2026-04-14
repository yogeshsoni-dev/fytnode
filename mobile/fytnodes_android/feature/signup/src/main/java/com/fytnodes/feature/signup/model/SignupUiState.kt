package com.fytnodes.feature.signup.model

sealed interface SignupUiState {
    val name: String
    val email: String
    val password: String

    data class Idle(
        override val name: String = "",
        override val email: String = "",
        override val password: String = "",
    ) : SignupUiState

    data class Loading(
        override val name: String,
        override val email: String,
        override val password: String,
    ) : SignupUiState

    data class Error(
        override val name: String,
        override val email: String,
        override val password: String,
        val message: String,
    ) : SignupUiState

    data class Success(
        val nextAction: String?,
        val message: String?,
        override val name: String,
        override val email: String,
        override val password: String,
    ) : SignupUiState
}

