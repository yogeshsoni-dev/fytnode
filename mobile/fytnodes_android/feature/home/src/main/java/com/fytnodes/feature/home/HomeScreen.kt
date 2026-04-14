package com.fytnodes.feature.home

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.LocalActivity
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.draw.clip
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.fytnodes.core.ui.components.AppLayout
import com.fytnodes.core.ui.components.FytFilterChip
import com.fytnodes.core.ui.components.GlassCard
import com.fytnodes.core.ui.layout.ScreenContainer
import com.fytnodes.core.ui.theme.BottomNavHeight
import com.fytnodes.core.ui.theme.GlassBorder
import com.fytnodes.core.ui.theme.GlassWhite15
import com.fytnodes.core.ui.theme.NeonGreen
import com.fytnodes.core.ui.theme.Radius16
import com.fytnodes.core.ui.theme.Space2
import com.fytnodes.core.ui.theme.Space12
import com.fytnodes.core.ui.theme.Space16
import com.fytnodes.core.ui.theme.Space3
import com.fytnodes.core.ui.theme.Space4
import com.fytnodes.core.ui.theme.Space6
import com.fytnodes.core.ui.theme.Space24
import com.fytnodes.core.ui.theme.TextMuted
import com.fytnodes.core.ui.theme.TextPrimary
import com.fytnodes.core.ui.theme.TextSecondary
import com.fytnodes.feature.checkin.presentation.CheckInUiState
import com.fytnodes.feature.checkin.presentation.CheckInViewModel
import com.fytnodes.feature.home.model.DashboardStat
import com.fytnodes.feature.home.model.DashboardUiState
import com.fytnodes.feature.home.presentation.components.DailyCheckInCard
import androidx.compose.ui.tooling.preview.Preview
import com.fytnodes.core.ui.theme.FytNodesTheme
import com.fytnodes.core.ui.theme.Space1
import com.fytnodes.core.ui.theme.Space8

@Composable
fun DashboardRoute(
    onNavigateToActivity: () -> Unit = {},
    modifier: Modifier = Modifier,
    viewModel: DashboardViewModel = hiltViewModel(),
    checkInViewModel: CheckInViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val checkInUiState by checkInViewModel.uiState.collectAsStateWithLifecycle()
    when (val state = uiState) {
        DashboardUiState.Loading -> DashboardLoadingScreen(modifier = modifier)
        is DashboardUiState.Error -> DashboardErrorScreen(message = state.message, modifier = modifier)
        is DashboardUiState.Success -> DashboardScreen(
            uiState = state,
            checkInUiState = checkInUiState,
            onCheckInClick = checkInViewModel::checkIn,
            onRefreshProfile = viewModel::syncUserProfile,
            onNavigateToActivity = onNavigateToActivity,
            modifier = modifier,
        )
    }
}

@Composable
private fun DashboardScreen(
    uiState: DashboardUiState.Success,
    checkInUiState: CheckInUiState,
    onCheckInClick: () -> Unit,
    onRefreshProfile: () -> Unit,
    onNavigateToActivity: () -> Unit,
    modifier: Modifier = Modifier,
) {
    var selectedFilter by rememberSaveable { mutableStateOf("all") }

    AppLayout(modifier = modifier) {
        ScreenContainer(
            includeBottomNavPadding = true,
            horizontalPadding = Space6,
        ) {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(bottom = BottomNavHeight + Space6),
                verticalArrangement = Arrangement.spacedBy(Space6),
            ) {
                    item {
                        DashboardHeader(
                            welcomeName = uiState.welcomeName,
                            email = uiState.email,
                            onRefreshProfile = onRefreshProfile,
                        )
                    }

                    uiState.message?.let { message ->
                        item {
                            Text(
                                text = message,
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.error,
                            )
                        }
                    }

                    item {
                        DailyCheckInCard(
                            uiState = checkInUiState,
                            onCheckInClick = onCheckInClick,
                        )
                    }

                    item {
                        Text(
                            text = "Ready for Today's Challenges?",
                            style = MaterialTheme.typography.headlineMedium,
                            color = TextPrimary,
                            fontWeight = FontWeight.Bold,
                        )
                    }

                    item {
                        Row(horizontalArrangement = Arrangement.spacedBy(Space3)) {
                            FytFilterChip(
                                label = "All",
                                selected = selectedFilter == "all",
                                onClick = { selectedFilter = "all" },
                            )
                            FytFilterChip(
                                label = "Alone",
                                selected = selectedFilter == "alone",
                                onClick = { selectedFilter = "alone" },
                            )
                            FytFilterChip(
                                label = "With Friends",
                                selected = selectedFilter == "friends",
                                onClick = { selectedFilter = "friends" },
                            )
                        }
                    }

                    item {
                        LazyVerticalGrid(
                            columns = GridCells.Fixed(2),
                            horizontalArrangement = Arrangement.spacedBy(Space4),
                            verticalArrangement = Arrangement.spacedBy(Space4),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(Space24 * 5),
                        ) {
                            items(uiState.stats) { stat ->
                                ActivityCard(
                                    stat = stat,
                                    onClick = { },
                                )
                            }
                            item {
                                AddActivityCard(onClick = onNavigateToActivity)
                            }
                        }
                    }
                }
            }
        }
    }

@Composable
private fun DashboardHeader(
    welcomeName: String,
    email: String,
    onRefreshProfile: () -> Unit,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(Space4),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                modifier = Modifier
                    .size(Space12)
                    .border(BorderStroke(Space1 / 2, NeonGreen), CircleShape)
                    .clip(CircleShape)
                    .background(GlassWhite15),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = Icons.Default.Person,
                    contentDescription = "Profile image",
                    tint = TextPrimary,
                    modifier = Modifier.size(Space6),
                )
            }
            Column {
                Text(
                    text = "Hello",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextMuted,
                )
                Text(
                    text = welcomeName,
                    style = MaterialTheme.typography.headlineSmall,
                    color = TextPrimary,
                    fontWeight = FontWeight.Bold,
                )
                Text(
                    text = email,
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary,
                )
            }
        }
    }
}

@Composable
private fun ActivityCard(
    stat: DashboardStat,
    onClick: () -> Unit,
) {
    GlassCard(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(Space16 + Space2)
                .clip(RoundedCornerShape(Radius16))
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            stat.gradient.firstOrNull() ?: NeonGreen,
                            stat.gradient.getOrNull(1) ?: NeonGreen.copy(alpha = 0.6f),
                        ),
                    ),
                ),
        ) {
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(Space3)
                    .size(Space4 + Space1)
                    .background(TextPrimary.copy(alpha = 0.2f), RoundedCornerShape(Radius16 / 2)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = Icons.Default.TrendingUp,
                    contentDescription = "Trending activity",
                    tint = TextPrimary,
                    modifier = Modifier.size(Space2),
                )
            }

            Row(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(Space3),
            ) {
                repeat(3) { index ->
                    Box(
                        modifier = Modifier
                            .offset(x = -(Space1 * index))
                            .size(Space3 + Space1)
                            .background(
                                color = if (index % 2 == 0) NeonGreen else TextPrimary.copy(alpha = 0.7f),
                                shape = CircleShape,
                            )
                            .border(Space1 / 4, Color.White, CircleShape),
                    )
                }
            }
        }

        Column(modifier = Modifier.padding(top = Space3)) {
            Text(
                text = stat.label,
                style = MaterialTheme.typography.bodyLarge,
                color = TextPrimary,
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                text = "${stat.value}${stat.unit}",
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary,
            )
        }
    }
}

@Composable
private fun AddActivityCard(
    onClick: () -> Unit,
) {
    GlassCard(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            Box(
                modifier = Modifier
                    .size(Space8)
                    .background(GlassWhite15, RoundedCornerShape(Radius16)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "Add activity",
                    tint = TextPrimary,
                    modifier = Modifier.size(Space4),
                )
            }
            Text(
                text = "Add Activity",
                style = MaterialTheme.typography.bodyMedium,
                color = TextSecondary,
                modifier = Modifier.padding(top = Space3),
            )
        }
    }
}

@Composable
private fun DashboardLoadingScreen(modifier: Modifier = Modifier) {
    AppLayout(modifier = modifier) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Loading...", color = TextPrimary)
        }
    }
}

@Composable
private fun DashboardErrorScreen(message: String, modifier: Modifier = Modifier) {
    AppLayout(modifier = modifier) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text(message, color = MaterialTheme.colorScheme.error)
        }
    }
}

@Preview(showBackground = true)
@Composable
fun DashboardLoadingScreenPreview() {
    DashboardLoadingScreen()
}

@Preview(showBackground = true)
@Composable
fun DashboardErrorScreenPreview() {
    DashboardErrorScreen(message = "Failed to load dashboard")
}

@Preview(showBackground = true)
@Composable
fun DashboardScreenPreview() {
    val uiState = DashboardUiState.Success(
        welcomeName = "John",
        email = "john@example.com",
        stats = listOf(
            DashboardStat(
                label = "Morning Run",
                value = "40",
                unit = "min",
                goal = "/ 60 min",
                progress = 0.66f,
                icon = Icons.Default.LocalActivity,
                gradient = listOf(NeonGreen, NeonGreen.copy(alpha = 0.6f))
            ),
            DashboardStat(
                label = "Gym Session",
                value = "55",
                unit = "min",
                goal = "/ 60 min",
                progress = 0.91f,
                icon = Icons.Default.LocalActivity,
                gradient = listOf(Color(0xFFF59E0B), Color(0xFFFB923C))
            ),
            DashboardStat(
                label = "Yoga",
                value = "30",
                unit = "min",
                goal = "/ 45 min",
                progress = 0.75f,
                icon = Icons.Default.LocalActivity,
                gradient = listOf(Color(0xFF60A5FA), Color(0xFF2563EB))
            ),
        ),
    )
    FytNodesTheme {
        DashboardScreen(
            uiState = uiState,
            checkInUiState = CheckInUiState.Idle,
            onCheckInClick = {},
            onRefreshProfile = {},
            onNavigateToActivity = {},
        )
    }
}
