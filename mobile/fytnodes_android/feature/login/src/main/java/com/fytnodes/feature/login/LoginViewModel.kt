package com.fytnodes.feature.login

import androidx.lifecycle.viewModelScope
import com.fytnodes.core.common.result.AppResult
import com.fytnodes.core.domain.login.model.LoginRequest
import com.fytnodes.core.domain.login.usecase.LoginUseCase
import com.fytnodes.core.ui.base.BaseViewModel
import com.fytnodes.feature.login.model.LoginUiEffect
import com.fytnodes.feature.login.model.LoginUiEvent
import com.fytnodes.feature.login.model.LoginUiState
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.launch

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val loginUseCase: LoginUseCase,
) : BaseViewModel() {
    private var email: String = ""
    private var password: String = ""

    private val _uiState = MutableStateFlow<LoginUiState>(LoginUiState.Idle)
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    private val _uiEffect = MutableSharedFlow<LoginUiEffect>()
    val uiEffect: SharedFlow<LoginUiEffect> = _uiEffect.asSharedFlow()

    fun onEvent(event: LoginUiEvent) {
        when (event) {
            is LoginUiEvent.OnEmailChanged -> email = event.value
            is LoginUiEvent.OnPasswordChanged -> password = event.value
            LoginUiEvent.Submit -> login(email = email, password = password)
            LoginUiEvent.NavigateToSignupClick -> emitEffect(LoginUiEffect.NavigateToSignup)
        }
    }

    private fun login(email: String, password: String) {
        if (!email.contains("@")) {
            val message = "Invalid email format"
            _uiState.value = LoginUiState.Error(message)
            emitEffect(LoginUiEffect.ShowMessage(message))
            return
        }
        if (password.isBlank()) {
            val message = "Password is required"
            _uiState.value = LoginUiState.Error(message)
            emitEffect(LoginUiEffect.ShowMessage(message))
            return
        }

        viewModelScope.launch {
            _uiState.value = LoginUiState.Loading
            when (
                val result = loginUseCase(
                    LoginRequest(
                        email = email.trim(),
                        password = password,
                    ),
                )
            ) {
                is AppResult.Success -> {
                    _uiState.value = LoginUiState.Success(result.data.accessToken)
                    emitEffect(LoginUiEffect.NavigateToDashboard)
                }
                is AppResult.Error -> {
                    _uiState.value = LoginUiState.Error(result.message)
                    emitEffect(LoginUiEffect.ShowMessage(result.message))
                }
            }
        }
    }

    private fun emitEffect(effect: LoginUiEffect) {
        viewModelScope.launch { _uiEffect.emit(effect) }
    }
}

