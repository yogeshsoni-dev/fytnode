package com.fytnodes.feature.profile.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fytnodes.core.domain.user.usecase.GetUserProfileUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch

sealed interface ProfileUiEffect {
    data object NavigateToLogin : ProfileUiEffect
}

data class ProfileUiState(
    val name: String = "",
    val email: String = "",
)

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val getUserProfileUseCase: GetUserProfileUseCase,
    private val sessionStore: com.fytnodes.core.domain.store.SessionStore,
) : ViewModel() {
    private val _uiEffect = MutableSharedFlow<ProfileUiEffect>()
    val uiEffect: SharedFlow<ProfileUiEffect> = _uiEffect.asSharedFlow()
    val uiState: StateFlow<ProfileUiState> = getUserProfileUseCase()
        .map { user ->
            ProfileUiState(
                name = user?.name.orEmpty(),
                email = user?.email.orEmpty(),
            )
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = ProfileUiState(),
        )

    fun onLogoutClick() {
        viewModelScope.launch {
            sessionStore.clear()
            _uiEffect.emit(ProfileUiEffect.NavigateToLogin)
        }
    }
}
