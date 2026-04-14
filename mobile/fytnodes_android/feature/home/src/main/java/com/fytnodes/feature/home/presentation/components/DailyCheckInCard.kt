package com.fytnodes.feature.home.presentation.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import com.fytnodes.core.ui.theme.GlassWhite15
import com.fytnodes.core.ui.theme.NeonGreen
import com.fytnodes.core.ui.theme.Radius16
import com.fytnodes.core.ui.theme.Space1
import com.fytnodes.core.ui.theme.Space10
import com.fytnodes.core.ui.theme.Space2
import com.fytnodes.core.ui.theme.Space3
import com.fytnodes.core.ui.theme.Space4
import com.fytnodes.core.ui.theme.Space6
import com.fytnodes.core.ui.theme.TextBlack
import com.fytnodes.core.ui.theme.TextPrimary
import com.fytnodes.core.ui.theme.TextSecondary
import com.fytnodes.core.ui.components.GlassCard
import com.fytnodes.feature.checkin.presentation.CheckInUiState

@Composable
fun DailyCheckInCard(
    uiState: CheckInUiState,
    onCheckInClick: () -> Unit,
    onCheckOutClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val checkedInState = uiState as? CheckInUiState.CheckedIn
    val checkedOutState = uiState as? CheckInUiState.CheckedOut
    val streak = checkedOutState?.streak ?: checkedInState?.streak ?: 0
    val isLoading = uiState is CheckInUiState.LoadingCheckIn || uiState is CheckInUiState.LoadingCheckOut
    val isCompleted = checkedOutState != null
    val isReadyForCheckout = checkedInState != null
    val enabled = !isLoading && !isCompleted
    val buttonText = when {
        isCompleted -> "Completed"
        isReadyForCheckout -> "Check-out"
        else -> "Check-in"
    }
    val action = if (isReadyForCheckout) onCheckOutClick else onCheckInClick
    val buttonScale = animateFloatAsState(
        targetValue = if (enabled) 1f else 0.98f,
        animationSpec = tween(durationMillis = 150),
        label = "checkin_button_scale",
    ).value

    Column(modifier = modifier.fillMaxWidth()) {
        GlassCard(
            modifier = Modifier.fillMaxWidth(),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(Space3),
            ) {
                Box(
                    modifier = Modifier
                        .size(Space10)
                        .background(color = GlassWhite15, shape = RoundedCornerShape(Radius16 / 2)),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        imageVector = Icons.Default.LocalFireDepartment,
                        contentDescription = "Daily check-in",
                        tint = NeonGreen,
                        modifier = Modifier.size(Space6),
                    )
                }

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Daily Check-in",
                        style = MaterialTheme.typography.titleSmall,
                        color = TextPrimary,
                    )
                }

                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = streak.toString(),
                        style = MaterialTheme.typography.titleLarge,
                        color = NeonGreen,
                    )
                    Text(
                        text = "Day Streak",
                        style = MaterialTheme.typography.labelSmall,
                        color = TextSecondary,
                    )
                }

                Button(
                    onClick = action,
                    enabled = enabled,
                    modifier = Modifier.scale(buttonScale),
                    shape = RoundedCornerShape(Radius16),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = NeonGreen,
                        contentColor = TextBlack,
                        disabledContainerColor = NeonGreen.copy(alpha = 0.5f),
                        disabledContentColor = TextBlack.copy(alpha = 0.75f),
                    ),
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(Space4),
                            strokeWidth = Space1 / 2,
                            color = TextBlack,
                        )
                    } else {
                        Text(
                            text = buttonText,
                            style = MaterialTheme.typography.labelLarge,
                        )
                    }
                }
            }
        }

        if (checkedInState != null || checkedOutState != null) {
            Spacer(modifier = Modifier.height(Space2))
            Text(
                text = checkedOutState?.message ?: checkedInState?.message.orEmpty(),
                color = NeonGreen,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(horizontal = Space2),
            )
        }

        if (uiState is CheckInUiState.Error) {
            Spacer(modifier = Modifier.height(Space2))
            Text(
                text = uiState.message,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(horizontal = Space2),
            )
        }
    }
}
