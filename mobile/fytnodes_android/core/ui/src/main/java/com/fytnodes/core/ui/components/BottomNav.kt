package com.fytnodes.core.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.runtime.getValue
import androidx.compose.runtime.Composable
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import com.fytnodes.core.navigation.BottomNavItem
import com.fytnodes.core.ui.theme.BottomNavHeight
import com.fytnodes.core.ui.theme.GlassBorder
import com.fytnodes.core.ui.theme.NeonGreen
import com.fytnodes.core.ui.theme.Radius16
import com.fytnodes.core.ui.theme.Space1
import com.fytnodes.core.ui.theme.Space2
import com.fytnodes.core.ui.theme.Space12
import com.fytnodes.core.ui.theme.Space6
import com.fytnodes.core.ui.theme.TextBlack
import com.fytnodes.core.ui.theme.TextPrimary

@Composable
fun BottomNav(
    items: List<BottomNavItem>,
    selectedRoute: String,
    onItemSelected: (BottomNavItem) -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .height(BottomNavHeight)
            .background(TextBlack.copy(alpha = 0.4f))
            .border(width = Space1 / 4, color = GlassBorder)
            .navigationBarsPadding()
            .padding(horizontal = Space2),
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        items.forEach { item ->
            val selected = selectedRoute == item.route
            val scale by animateFloatAsState(
                targetValue = if (selected) 1.1f else 1f,
                animationSpec = tween(durationMillis = 150),
                label = "bottom_nav_scale",
            )

            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .clickable { onItemSelected(item) },
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Box(
                        modifier = Modifier
                            .size(Space12)
                            .scale(scale)
                            .background(
                                color = if (selected) NeonGreen else Color.Transparent,
                                shape = RoundedCornerShape(Radius16),
                            ),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(
                            imageVector = item.icon,
                            contentDescription = item.route,
                            tint = if (selected) TextBlack else TextPrimary.copy(alpha = 0.6f),
                            modifier = Modifier
                                .size(Space6)
                                .background(Color.Transparent),
                        )
                    }
                    Spacer(modifier = Modifier.height(Space2))
                    if (selected) {
                        Box(
                            modifier = Modifier
                                .size(Space1)
                                .background(NeonGreen, RoundedCornerShape(Radius16)),
                        )
                    } else {
                        Spacer(modifier = Modifier.height(Space1))
                    }
                }
            }
        }
    }
}

