package com.fytnodes.core.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.fytnodes.core.designsystem.theme.FytNodesGradients
import com.fytnodes.core.designsystem.theme.FytNodesShapes

@Composable
fun IconBadge(
    icon: ImageVector,
    modifier: Modifier = Modifier,
    gradient: List<Color> = FytNodesGradients.Teal,
    size: Dp = 56.dp,
    iconSize: Dp = 28.dp,
) {
    Box(
        modifier = modifier
            .size(size)
            .shadow(4.dp, FytNodesShapes.ExtraLarge)
            .background(
                brush = Brush.linearGradient(colors = gradient, start = Offset.Zero, end = Offset.Infinite),
                shape = FytNodesShapes.ExtraLarge,
            ),
        contentAlignment = Alignment.Center,
    ) {
        Icon(imageVector = icon, contentDescription = null, tint = Color.White, modifier = Modifier.size(iconSize))
    }
}

