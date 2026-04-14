package com.fytnodes.core.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.foundation.shape.RoundedCornerShape
import com.fytnodes.core.ui.theme.GlassBorder
import com.fytnodes.core.ui.theme.GlassWhite
import com.fytnodes.core.ui.theme.Radius24
import com.fytnodes.core.ui.theme.Space5
import com.fytnodes.core.ui.theme.Space6

@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    content: @Composable ColumnScope.() -> Unit,
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = GlassWhite),
        shape = RoundedCornerShape(Radius24),
        border = BorderStroke(width = com.fytnodes.core.ui.theme.Space1 / 4, color = GlassBorder),
        elevation = CardDefaults.cardElevation(defaultElevation = com.fytnodes.core.ui.theme.Space2),
    ) {
        Column(modifier = Modifier.fillMaxWidth().padding(Space5), content = content)
    }
}

