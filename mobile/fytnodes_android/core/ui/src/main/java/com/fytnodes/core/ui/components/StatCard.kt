package com.fytnodes.core.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.fytnodes.core.designsystem.theme.FytNodesColors
import com.fytnodes.core.designsystem.theme.FytNodesGradients

@Composable
fun StatCard(
    label: String,
    value: String,
    unit: String,
    icon: ImageVector,
    modifier: Modifier = Modifier,
    gradient: List<Color> = FytNodesGradients.Teal,
    progress: Float? = null,
    goal: String = "",
) {
    FytCard(modifier = modifier, padding = CardPadding.MEDIUM) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top,
        ) {
            IconBadge(icon = icon, gradient = gradient)
            Box(
                modifier = Modifier
                    .background(
                        brush = Brush.linearGradient(colors = gradient, start = Offset.Zero, end = Offset.Infinite),
                        shape = RoundedCornerShape(50),
                    )
                    .padding(horizontal = 12.dp, vertical = 6.dp),
            ) {
                Text(text = label, style = MaterialTheme.typography.labelSmall, color = Color.White, fontWeight = FontWeight.SemiBold)
            }
        }
        Text(text = value, style = MaterialTheme.typography.displayMedium, color = FytNodesColors.Text, fontWeight = FontWeight.Bold)
        Text(
            text = "$unit $goal",
            style = MaterialTheme.typography.bodySmall,
            color = FytNodesColors.TextLight,
            modifier = Modifier.padding(bottom = 12.dp),
        )
        progress?.let { FytProgressBar(progress = it, gradient = gradient) }
    }
}

