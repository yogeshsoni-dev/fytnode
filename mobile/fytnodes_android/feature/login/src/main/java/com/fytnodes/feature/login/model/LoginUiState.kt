package com.fytnodes.feature.login.model

sealed interface LoginUiState {
    data object Idle : LoginUiState
    data object Loading : LoginUiState
    data class Success(val token: String) : LoginUiState
    data class Error(val message: String) : LoginUiState
}

