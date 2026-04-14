package com.fytnodes.feature.splash

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import com.fytnodes.core.ui.components.AppLayout
import com.fytnodes.core.ui.layout.ScreenContainer
import com.fytnodes.core.ui.theme.TextPrimary
import com.fytnodes.feature.splash.model.SplashUiEffect
import kotlinx.coroutines.flow.collect

@Composable
fun SplashRoute(
    onNavigateToOnboarding: () -> Unit,
    onNavigateToDashboard: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: SplashViewModel = hiltViewModel(),
) {
    LaunchedEffect(Unit) {
        viewModel.uiEffect.collect { effect ->
            when (effect) {
                SplashUiEffect.NavigateToOnboarding -> onNavigateToOnboarding()
                SplashUiEffect.NavigateToDashboard -> onNavigateToDashboard()
            }
        }
    }

    SplashScreen(modifier = modifier)
}

@Composable
fun SplashScreen(
    modifier: Modifier = Modifier,
) {
    AppLayout(modifier = modifier) {
        ScreenContainer {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = "FytNodes",
                    style = MaterialTheme.typography.headlineMedium,
                    color = TextPrimary,
                )
            }
        }
    }
}

