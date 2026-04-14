package com.fytnodes.feature.checkin.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fytnodes.core.common.result.AppResult
import com.fytnodes.feature.checkin.domain.usecase.CheckInUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class CheckInUiState {
    data object Idle : CheckInUiState()
    data object Loading : CheckInUiState()
    data class Success(val message: String) : CheckInUiState()
    data class Error(val message: String) : CheckInUiState()
}

@HiltViewModel
class CheckInViewModel @Inject constructor(
    private val checkInUseCase: CheckInUseCase,
) : ViewModel() {
    private val _uiState = MutableStateFlow<CheckInUiState>(CheckInUiState.Idle)
    val uiState: StateFlow<CheckInUiState> = _uiState.asStateFlow()

    fun checkIn() {
        if (_uiState.value is CheckInUiState.Loading) return
        viewModelScope.launch {
            _uiState.value = CheckInUiState.Loading
            _uiState.value = when (val result = checkInUseCase()) {
                is AppResult.Success -> CheckInUiState.Success(message = result.data.message)
                is AppResult.Error -> CheckInUiState.Error(result.message)
            }
        }
    }
}
