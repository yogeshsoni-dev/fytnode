package com.fytnodes.feature.onboarding.presentation

import androidx.compose.foundation.background
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.Place
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import com.fytnodes.core.ui.components.AppLayout
import com.fytnodes.core.ui.components.GlassCard
import com.fytnodes.core.ui.components.PrimaryButton
import com.fytnodes.core.ui.components.SecondaryButton
import com.fytnodes.core.ui.layout.ScreenContainer
import com.fytnodes.core.ui.theme.FytNodesTheme
import com.fytnodes.core.ui.theme.NeonGreen
import com.fytnodes.core.ui.theme.Radius16
import com.fytnodes.core.ui.theme.Space10
import com.fytnodes.core.ui.theme.Space12
import com.fytnodes.core.ui.theme.Space20
import com.fytnodes.core.ui.theme.Space2
import com.fytnodes.core.ui.theme.Space3
import com.fytnodes.core.ui.theme.Space4
import com.fytnodes.core.ui.theme.Space6
import com.fytnodes.core.ui.theme.Space8
import com.fytnodes.core.ui.theme.TextSecondary

data class OnboardingStep(
    val icon: ImageVector,
    val title: String,
    val description: String,
)

@Composable
fun OnboardingRoute(
    onComplete: () -> Unit,
    modifier: Modifier = Modifier,
) {
    OnboardingScreen(onComplete = onComplete, modifier = modifier)
}

@Composable
fun OnboardingScreen(
    onComplete: () -> Unit,
    modifier: Modifier = Modifier,
) {
    var currentStep by remember { mutableIntStateOf(0) }
    val steps = listOf(
        OnboardingStep(
            icon = Icons.Default.FitnessCenter,
            title = "Track Your Fitness",
            description = "Monitor your workouts, running sessions, and daily activities with precision tracking and insights.",
        ),
        OnboardingStep(
            icon = Icons.Default.CameraAlt,
            title = "AI Food Scanner",
            description = "Scan your meals instantly with AI-powered recognition. Get accurate calorie counts and nutritional info.",
        ),
        OnboardingStep(
            icon = Icons.Default.Place,
            title = "Gamified Territory Running",
            description = "Claim territories as you run! Compete with friends and unlock new zones in your city.",
        ),
    )

    AppLayout(modifier = modifier) {
        ScreenContainer(
            modifier = Modifier,
            horizontalPadding = Space6,
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
            ) {
                TextButton(onClick = onComplete) {
                    Text(text = "Skip", color = TextSecondary)
                }
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f, fill = true),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                GlassCard(modifier = Modifier.padding(horizontal = Space12, vertical = Space4)) {
                    Box(
                        modifier = Modifier.fillMaxWidth(),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(
                            imageVector = steps[currentStep].icon,
                            contentDescription = null,
                            modifier = Modifier.size(Space20),
                            tint = NeonGreen,
                        )
                    }
                }

                Spacer(modifier = Modifier.height(Space12))
                Text(
                    text = steps[currentStep].title,
                    style = androidx.compose.material3.MaterialTheme.typography.displaySmall,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                )
                Spacer(modifier = Modifier.height(Space4))
                Text(
                    text = steps[currentStep].description,
                    style = androidx.compose.material3.MaterialTheme.typography.bodyLarge,
                    color = TextSecondary,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = Space8),
                )
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = Space8),
                horizontalArrangement = Arrangement.Center,
            ) {
                steps.forEachIndexed { index, _ ->
                    Box(
                        modifier = Modifier
                            .height(Space2)
                            .width(if (index == currentStep) Space8 else Space2)
                            .background(
                                color = if (index == currentStep) NeonGreen else TextSecondary.copy(alpha = 0.3f),
                                shape = RoundedCornerShape(Radius16 / 4),
                            ),
                    )
                    if (index < steps.size - 1) Spacer(modifier = Modifier.width(Space2))
                }
            }

            PrimaryButton(
                text = if (currentStep < steps.lastIndex) "Next" else "Get Started",
                onClick = {
                    if (currentStep < steps.lastIndex) currentStep++ else onComplete()
                },
                modifier = Modifier.fillMaxWidth(),
            )

            if (currentStep > 0) {
                Spacer(modifier = Modifier.height(Space3))
                SecondaryButton(
                    text = "Back",
                    onClick = { currentStep-- },
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }
    }
}

@Preview
@Composable
private fun OnboardingStep1Preview() {
    FytNodesTheme { OnboardingScreen(onComplete = {}) }
}

