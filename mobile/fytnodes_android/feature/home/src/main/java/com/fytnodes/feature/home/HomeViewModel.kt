package com.fytnodes.feature.home

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DirectionsWalk
import androidx.compose.material.icons.filled.LocalFireDepartment
import com.fytnodes.core.common.result.AppResult
import com.fytnodes.core.domain.home.usecase.GetHomeDashboardUseCase
import com.fytnodes.core.domain.user.model.User
import com.fytnodes.core.domain.user.usecase.GetUserProfileUseCase
import com.fytnodes.core.domain.user.usecase.SyncUserProfileUseCase
import com.fytnodes.core.designsystem.theme.FytNodesGradients
import com.fytnodes.core.ui.base.BaseViewModel
import com.fytnodes.feature.home.model.DashboardStat
import com.fytnodes.feature.home.model.DashboardUiState
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import androidx.lifecycle.viewModelScope

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val getHomeDashboardUseCase: GetHomeDashboardUseCase,
    private val syncUserProfileUseCase: SyncUserProfileUseCase,
    private val getUserProfileUseCase: GetUserProfileUseCase,
) : BaseViewModel() {
    private val _uiState = MutableStateFlow<DashboardUiState>(DashboardUiState.Loading)
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    private var observeUserJob: Job? = null
    private var cachedStats: List<DashboardStat> = emptyList()
    private var refreshMessage: String? = null
    private var cachedUser: User? = null

    init {
        observeUserProfile()
        loadDashboard()
        syncUserProfile()
    }

    private fun loadDashboard() {
        viewModelScope.launch {
            when (val result = getHomeDashboardUseCase()) {
                is AppResult.Success -> {
                    cachedStats = result.data.stats.map {
                        DashboardStat(
                            label = it.label,
                            value = it.value,
                            unit = it.unit,
                            goal = it.goal,
                            progress = it.progress,
                            icon = if (it.key == "calories") Icons.Default.LocalFireDepartment else Icons.Default.DirectionsWalk,
                            gradient = if (it.key == "calories") FytNodesGradients.Red else FytNodesGradients.Teal,
                        )
                    }
                    cachedUser?.let { _uiState.value = toSuccessState(it) }
                }
                is AppResult.Error -> _uiState.value = DashboardUiState.Error(result.message)
            }
        }
    }

    private fun observeUserProfile() {
        observeUserJob?.cancel()
        observeUserJob = getUserProfileUseCase()
            .onEach { user: User? ->
                cachedUser = user
                if (user != null && cachedStats.isNotEmpty()) {
                    _uiState.value = toSuccessState(user)
                }
            }
            .launchIn(viewModelScope)
    }

    fun syncUserProfile() {
        viewModelScope.launch {
            when (val result = syncUserProfileUseCase()) {
                is AppResult.Success -> refreshMessage = null
                is AppResult.Error -> {
                    refreshMessage = "Unable to refresh profile"
                    val current = _uiState.value
                    if (current is DashboardUiState.Success) {
                        _uiState.value = current.copy(message = refreshMessage)
                    } else if (cachedStats.isEmpty()) {
                        _uiState.value = DashboardUiState.Error(refreshMessage ?: result.message)
                    }
                }
            }
        }
    }

    private fun toSuccessState(user: User): DashboardUiState.Success =
        DashboardUiState.Success(
            welcomeName = user.name,
            email = user.email,
            stats = cachedStats,
            message = refreshMessage,
        )
}

