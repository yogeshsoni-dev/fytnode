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
    data object LoadingCheckIn : CheckInUiState()
    data object LoadingCheckOut : CheckInUiState()
    data class CheckedIn(
        val attendanceId: Int,
        val streak: Int,
        val message: String,
    ) : CheckInUiState()
    data class CheckedOut(
        val streak: Int,
        val message: String,
    ) : CheckInUiState()
    data class Error(val message: String) : CheckInUiState()
}

@HiltViewModel
class CheckInViewModel @Inject constructor(
    private val checkInUseCase: CheckInUseCase,
) : ViewModel() {
    private val _uiState = MutableStateFlow<CheckInUiState>(CheckInUiState.Idle)
    val uiState: StateFlow<CheckInUiState> = _uiState.asStateFlow()
    private var currentStreak: Int = 0
    private var lastAttendanceId: Int? = null

    fun checkIn() {
        if (_uiState.value is CheckInUiState.LoadingCheckIn || _uiState.value is CheckInUiState.LoadingCheckOut) return
        viewModelScope.launch {
            _uiState.value = CheckInUiState.LoadingCheckIn
            _uiState.value = when (val result = checkInUseCase()) {
                is AppResult.Success -> {
                    lastAttendanceId = result.data.attendanceId
                    CheckInUiState.CheckedIn(
                        attendanceId = result.data.attendanceId,
                        streak = currentStreak,
                        message = result.data.message,
                    )
                }
                is AppResult.Error -> CheckInUiState.Error(result.message)
            }
        }
    }

    fun checkOut() {
        val attendanceId = lastAttendanceId
            ?: (_uiState.value as? CheckInUiState.CheckedIn)?.attendanceId
            ?: return
        if (_uiState.value is CheckInUiState.LoadingCheckOut) return
        viewModelScope.launch {
            _uiState.value = CheckInUiState.LoadingCheckOut
            _uiState.value = when (val result = checkInUseCase.checkOut(attendanceId)) {
                is AppResult.Success -> {
                    currentStreak += 1
                    CheckInUiState.CheckedOut(
                        streak = currentStreak,
                        message = result.data.message,
                    )
                }
                is AppResult.Error -> CheckInUiState.Error(result.message)
            }
        }
    }
}
