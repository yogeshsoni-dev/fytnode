package com.fytnodes.feature.home

import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable

const val DASHBOARD_ROUTE = "home"
const val TERRITORY_ROUTE = "territory"
const val COMMUNITY_ROUTE = "community"

sealed interface DashboardNavigation {
    data object Back : DashboardNavigation
}

fun NavGraphBuilder.dashboardScreen(
    onNavigateToActivity: () -> Unit = {},
) {
    composable(route = DASHBOARD_ROUTE) {
        DashboardRoute(onNavigateToActivity = onNavigateToActivity)
    }
}

