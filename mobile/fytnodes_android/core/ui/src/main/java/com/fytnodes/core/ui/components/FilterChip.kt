package com.fytnodes.core.ui.components

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.fytnodes.core.ui.theme.GlassBorder
import com.fytnodes.core.ui.theme.GlassWhite15
import com.fytnodes.core.ui.theme.NeonGreen
import com.fytnodes.core.ui.theme.RadiusFull
import com.fytnodes.core.ui.theme.TextBlack
import com.fytnodes.core.ui.theme.TextTertiary

@Composable
fun FytFilterChip(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    FilterChip(
        selected = selected,
        onClick = onClick,
        modifier = modifier,
        label = { Text(label) },
        shape = RoundedCornerShape(RadiusFull),
        colors = FilterChipDefaults.filterChipColors(
            selectedContainerColor = NeonGreen,
            selectedLabelColor = TextBlack,
            containerColor = GlassWhite15,
            labelColor = TextTertiary,
        ),
        border = FilterChipDefaults.filterChipBorder(
            enabled = true,
            selected = selected,
            borderColor = if (selected) NeonGreen else GlassBorder,
        ),
    )
}

