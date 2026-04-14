package com.fytnodes.core.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import com.fytnodes.core.ui.theme.BackgroundDarkEnd
import com.fytnodes.core.ui.theme.BackgroundDarkMiddle
import com.fytnodes.core.ui.theme.BackgroundDarkStart

@Composable
fun AppLayout(
    modifier: Modifier = Modifier,
    content: @Composable BoxScope.() -> Unit,
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                brush = Brush.linearGradient(
                    colors = listOf(BackgroundDarkStart, BackgroundDarkMiddle, BackgroundDarkEnd),
                    start = Offset.Zero,
                    end = Offset.Infinite,
                ),
            ),
        content = content,
    )
}

