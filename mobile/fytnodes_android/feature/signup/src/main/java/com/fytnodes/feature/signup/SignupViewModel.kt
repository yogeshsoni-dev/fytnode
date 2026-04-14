package com.fytnodes.feature.signup

import androidx.lifecycle.viewModelScope
import com.fytnodes.core.common.result.AppResult
import com.fytnodes.core.domain.signup.model.SignupRequest
import com.fytnodes.core.domain.signup.usecase.SignupUseCase
import com.fytnodes.core.ui.base.BaseViewModel
import com.fytnodes.feature.signup.model.SignupUiEffect
import com.fytnodes.feature.signup.model.SignupUiEvent
import com.fytnodes.feature.signup.model.SignupUiState
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

@HiltViewModel
class SignupViewModel @Inject constructor(
    private val signupUseCase: SignupUseCase,
) : BaseViewModel() {
    private val _uiState = MutableStateFlow<SignupUiState>(SignupUiState.Idle())
    val uiState: StateFlow<SignupUiState> = _uiState.asStateFlow()

    private val _uiEffect = MutableSharedFlow<SignupUiEffect>()
    val uiEffect: SharedFlow<SignupUiEffect> = _uiEffect.asSharedFlow()

    fun onEvent(event: SignupUiEvent) {
        when (event) {
            is SignupUiEvent.OnNameChanged -> updateForm(name = event.value)
            is SignupUiEvent.OnEmailChanged -> updateForm(email = event.value)
            is SignupUiEvent.OnPasswordChanged -> updateForm(password = event.value)
            SignupUiEvent.NavigateBackClick -> emitEffect(SignupUiEffect.NavigateBack)
            SignupUiEvent.Submit -> submit()
        }
    }

    private fun updateForm(
        name: String? = null,
        email: String? = null,
        password: String? = null,
    ) {
        _uiState.update { current ->
            val nextName = name ?: current.name
            val nextEmail = email ?: current.email
            val nextPassword = password ?: current.password
            SignupUiState.Idle(
                name = nextName,
                email = nextEmail,
                password = nextPassword,
            )
        }
    }

    private fun submit() {
        val state = _uiState.value
        if (state.name.isBlank()) return updateError("Please enter your name")
        if (!state.email.contains("@")) return updateError("Please enter a valid email")
        if (state.password.length < 6) return updateError("Password must be at least 6 characters")
        viewModelScope.launch {
            _uiState.value = SignupUiState.Loading(
                name = state.name,
                email = state.email,
                password = state.password,
            )
            when (
                val result = signupUseCase(
                    SignupRequest(
                        name = state.name.trim(),
                        email = state.email.trim(),
                        password = state.password,
                    ),
                )
            ) {
                is AppResult.Success -> {
                    val nextAction = result.data.nextAction
                    val message = result.data.message
                    _uiState.value = SignupUiState.Success(
                        nextAction = nextAction,
                        message = message,
                        name = state.name,
                        email = state.email,
                        password = state.password,
                    )
                    if (!message.isNullOrBlank()) {
                        emitEffect(SignupUiEffect.ShowMessage(message))
                    }
                    if (nextAction == NEXT_ACTION_LOGIN) {
                        emitEffect(SignupUiEffect.NavigateToLogin)
                    }
                }

                is AppResult.Error -> {
                    _uiState.value = SignupUiState.Error(
                        name = state.name,
                        email = state.email,
                        password = state.password,
                        message = result.message,
                    )
                    emitEffect(SignupUiEffect.ShowMessage(result.message))
                }
            }
        }
    }

    private fun updateError(message: String) {
        val state = _uiState.value
        _uiState.value = SignupUiState.Error(
            name = state.name,
            email = state.email,
            password = state.password,
            message = message,
        )
        emitEffect(SignupUiEffect.ShowMessage(message))
    }

    private fun emitEffect(effect: SignupUiEffect) {
        viewModelScope.launch { _uiEffect.emit(effect) }
    }

    private companion object {
        const val NEXT_ACTION_LOGIN = "LOGIN"
    }
}

