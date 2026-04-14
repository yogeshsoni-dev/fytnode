package com.fytnodes.feature.profile.presentation

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.fytnodes.core.ui.components.AppLayout
import com.fytnodes.core.ui.components.GlassCard
import com.fytnodes.core.ui.components.SecondaryButton
import com.fytnodes.core.ui.layout.ScreenContainer
import com.fytnodes.core.ui.theme.BottomNavHeight
import com.fytnodes.core.ui.theme.FytNodesTheme
import com.fytnodes.core.ui.theme.GlassWhite15
import com.fytnodes.core.ui.theme.NeonGreen
import com.fytnodes.core.ui.theme.Radius16
import com.fytnodes.core.ui.theme.Red400
import com.fytnodes.core.ui.theme.Space1
import com.fytnodes.core.ui.theme.Space10
import com.fytnodes.core.ui.theme.Space12
import com.fytnodes.core.ui.theme.Space16
import com.fytnodes.core.ui.theme.Space2
import com.fytnodes.core.ui.theme.Space3
import com.fytnodes.core.ui.theme.Space4
import com.fytnodes.core.ui.theme.Space6
import com.fytnodes.core.ui.theme.Space8
import com.fytnodes.core.ui.theme.TextPrimary
import com.fytnodes.core.ui.theme.TextSecondary
import kotlinx.coroutines.flow.collectLatest

const val PROFILE_ROUTE = "profile"

@Composable
fun ProfileRoute(
    onLogout: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ProfileViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) {
        viewModel.uiEffect.collectLatest { effect ->
            when (effect) {
                ProfileUiEffect.NavigateToLogin -> onLogout()
            }
        }
    }

    ProfileScreen(
        name = uiState.name.ifBlank { "User" },
        email = uiState.email,
        onLogoutClick = viewModel::onLogoutClick,
        modifier = modifier,
    )
}

@Composable
fun ProfileScreen(
    name: String,
    email: String,
    onLogoutClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val achievements = listOf(
        AchievementUi(Icons.Default.EmojiEvents, "First Run", true),
        AchievementUi(Icons.Default.Star, "10K Master", true),
        AchievementUi(Icons.Default.LocalFireDepartment, "7 Day Streak", true),
        AchievementUi(Icons.Default.LocationOn, "Territory King", false),
        AchievementUi(Icons.Default.Bolt, "Social Butterfly", false),
        AchievementUi(Icons.Default.Groups, "Monthly Goal", false),
    )

    AppLayout(modifier = modifier) {
        ScreenContainer(
            includeBottomNavPadding = true,
            horizontalPadding = Space4,
            modifier = Modifier.verticalScroll(rememberScrollState()),
        ) {
            Text(
                text = "Profile",
                style = MaterialTheme.typography.headlineSmall,
                color = TextPrimary,
                fontWeight = FontWeight.Bold,
            )
            Spacer(modifier = Modifier.height(Space4))

            GlassCard {
                ProfileHeader(
                    name = name,
                    email = email,
                )
                Spacer(modifier = Modifier.height(Space4))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    StatsItem(label = "Followers", value = "150", modifier = Modifier.weight(1f))
                    StatsItem(label = "Following", value = "89", modifier = Modifier.weight(1f))
                    StatsItem(label = "Rank", value = "Level\n12", modifier = Modifier.weight(1f))
                }

                Spacer(modifier = Modifier.height(Space4))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(text = "Level 12", style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                    Text(text = "Level 13", style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                }
                Spacer(modifier = Modifier.height(Space2))
                ProfileProgress(progress = 0.72f)
                Spacer(modifier = Modifier.height(Space2))
                Text(
                    text = "750 / 1000 XP to next level",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary,
                    modifier = Modifier.align(Alignment.CenterHorizontally),
                )
            }

            Spacer(modifier = Modifier.height(Space4))
            Text(
                text = "Achievements",
                style = MaterialTheme.typography.titleMedium,
                color = TextPrimary,
                fontWeight = FontWeight.SemiBold,
            )
            Spacer(modifier = Modifier.height(Space3))

            GlassCard {
                Column(verticalArrangement = Arrangement.spacedBy(Space3)) {
                    achievements.chunked(3).forEach { rowItems ->
                        Row(horizontalArrangement = Arrangement.spacedBy(Space3)) {
                            rowItems.forEach { achievement ->
                                AchievementItem(
                                    item = achievement,
                                    modifier = Modifier.weight(1f),
                                )
                            }
                            repeat(3 - rowItems.size) {
                                Spacer(modifier = Modifier.weight(1f))
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(Space6))
            SecondaryButton(text = "Edit Profile", onClick = { })
            Spacer(modifier = Modifier.height(Space3))
            Button(
                onClick = onLogoutClick,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(Radius16),
                colors = ButtonDefaults.buttonColors(
                    containerColor = GlassWhite15,
                    contentColor = Red400,
                ),
            ) {
                Icon(
                    imageVector = Icons.Default.Logout,
                    contentDescription = "Logout",
                    tint = Red400,
                    modifier = Modifier.size(Space4),
                )
                Spacer(modifier = Modifier.size(Space2))
                Text(text = "Logout", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
            }
            Spacer(modifier = Modifier.height(BottomNavHeight + Space2))
        }
    }
}

@Composable
private fun ProfileHeader(
    name: String,
    email: String,
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(Space4),
    ) {
        Box(
            modifier = Modifier
                .size(Space16)
                .border(Space1 / 2, NeonGreen, CircleShape)
                .background(GlassWhite15, CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            Box(modifier = Modifier.size(Space8).background(Color.Transparent))
        }
        Column {
            Text(
                text = name,
                style = MaterialTheme.typography.titleMedium,
                color = TextPrimary,
                fontWeight = FontWeight.Bold,
            )
            if (email.isNotBlank()) {
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
private fun StatsItem(
    label: String,
    value: String,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = value,
            style = MaterialTheme.typography.titleMedium,
            color = NeonGreen,
            fontWeight = FontWeight.Bold,
        )
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = TextSecondary,
        )
    }
}

@Composable
private fun AchievementItem(
    item: AchievementUi,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .background(Color.Transparent, RoundedCornerShape(Radius16))
            .padding(vertical = Space2),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(Space2),
    ) {
        Box(
            modifier = Modifier
                .size(Space10)
                .background(
                    if (item.unlocked) NeonGreen.copy(alpha = 0.18f) else GlassWhite15.copy(alpha = 0.4f),
                    RoundedCornerShape(Radius16),
                )
                .border(Space1 / 4, if (item.unlocked) NeonGreen.copy(alpha = 0.6f) else GlassWhite15, RoundedCornerShape(Radius16)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = item.icon,
                contentDescription = item.title,
                tint = if (item.unlocked) NeonGreen else TextSecondary.copy(alpha = 0.45f),
                modifier = Modifier.size(Space4),
            )
        }
        Text(
            text = item.title,
            style = MaterialTheme.typography.labelSmall,
            color = if (item.unlocked) TextSecondary else TextSecondary.copy(alpha = 0.45f),
            fontWeight = FontWeight.Medium,
        )
    }
}

@Composable
private fun ProfileProgress(progress: Float) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(Space2)
            .background(GlassWhite15, RoundedCornerShape(Radius16)),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth(progress.coerceIn(0f, 1f))
                .height(Space2)
                .background(NeonGreen, RoundedCornerShape(Radius16)),
        )
    }
}

private data class AchievementUi(
    val icon: ImageVector,
    val title: String,
    val unlocked: Boolean,
)

@Preview(showBackground = true)
@Composable
private fun ProfileScreenPreview() {
    FytNodesTheme {
        ProfileScreen(
            name = "Alex Johnson",
            email = "alex@example.com",
            onLogoutClick = {},
        )
    }
}
