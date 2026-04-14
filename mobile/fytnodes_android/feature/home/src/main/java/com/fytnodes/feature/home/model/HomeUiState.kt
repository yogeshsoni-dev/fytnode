package com.fytnodes.feature.home.model

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector

sealed interface DashboardUiState {
    data object Loading : DashboardUiState
    data class Success(
        val welcomeName: String,
        val email: String,
        val stats: List<DashboardStat>,
        val message: String? = null,
    ) : DashboardUiState
    data class Error(val message: String) : DashboardUiState
}

data class DashboardStat(
    val label: String,
    val value: String,
    val unit: String,
    val goal: String,
    val progress: Float,
    val icon: ImageVector,
    val gradient: List<Color>,
)

