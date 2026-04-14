package com.fytnodes.core.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.PressInteraction
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.fytnodes.core.designsystem.theme.FytNodesGradients
import com.fytnodes.core.designsystem.theme.FytNodesShapes

enum class ButtonVariant { TEAL, BLUE, RED, ORANGE, PURPLE, DARK }
enum class ButtonSize { SMALL, MEDIUM, LARGE }

@Composable
fun FytButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: ButtonVariant = ButtonVariant.TEAL,
    size: ButtonSize = ButtonSize.MEDIUM,
    icon: ImageVector? = null,
    enabled: Boolean = true,
    loading: Boolean = false,
) {
    var isPressed by remember { mutableStateOf(false) }
    val interactionSource = remember { MutableInteractionSource() }
    val scale by animateFloatAsState(if (isPressed) 0.96f else 1f, label = "button_scale")

    LaunchedEffect(interactionSource) {
        interactionSource.interactions.collect { interaction ->
            when (interaction) {
                is PressInteraction.Press -> isPressed = true
                is PressInteraction.Release, is PressInteraction.Cancel -> isPressed = false
            }
        }
    }

    val gradient = when (variant) {
        ButtonVariant.TEAL -> FytNodesGradients.Teal
        ButtonVariant.BLUE -> FytNodesGradients.Blue
        ButtonVariant.RED -> FytNodesGradients.Red
        ButtonVariant.ORANGE -> FytNodesGradients.Orange
        ButtonVariant.PURPLE -> FytNodesGradients.Purple
        ButtonVariant.DARK -> FytNodesGradients.Dark
    }

    val contentPadding = when (size) {
        ButtonSize.SMALL -> PaddingValues(horizontal = 16.dp, vertical = 10.dp)
        ButtonSize.MEDIUM -> PaddingValues(horizontal = 24.dp, vertical = 14.dp)
        ButtonSize.LARGE -> PaddingValues(horizontal = 32.dp, vertical = 18.dp)
    }

    val textStyle = when (size) {
        ButtonSize.SMALL -> MaterialTheme.typography.bodySmall
        ButtonSize.MEDIUM -> MaterialTheme.typography.bodyMedium
        ButtonSize.LARGE -> MaterialTheme.typography.bodyLarge
    }

    Button(
        onClick = onClick,
        modifier = modifier
            .scale(scale)
            .shadow(8.dp, FytNodesShapes.ExtraLarge),
        enabled = enabled && !loading,
        shape = FytNodesShapes.ExtraLarge,
        colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent, contentColor = Color.White),
        contentPadding = PaddingValues(0.dp),
        interactionSource = interactionSource,
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Brush.linearGradient(colors = gradient, start = Offset.Zero, end = Offset.Infinite))
                .padding(contentPadding),
            contentAlignment = Alignment.Center,
        ) {
            Row(horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) {
                if (loading) {
                    CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                } else {
                    icon?.let {
                        Icon(imageVector = it, contentDescription = null, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.size(8.dp))
                    }
                    Text(text = text, style = textStyle, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}

