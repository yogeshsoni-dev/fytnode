package com.fytnodes.feature.splash

import androidx.lifecycle.viewModelScope
import com.fytnodes.core.ui.base.BaseViewModel
import com.fytnodes.feature.splash.model.SplashUiEffect
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.launch

@HiltViewModel
class SplashViewModel @Inject constructor() : BaseViewModel() {

    private val _uiEffect = MutableSharedFlow<SplashUiEffect>()
    val uiEffect: SharedFlow<SplashUiEffect> = _uiEffect.asSharedFlow()

    init {
        viewModelScope.launch {
            delay(SPLASH_DELAY_MS)
            _uiEffect.emit(SplashUiEffect.NavigateToOnboarding)
        }
    }

    private companion object {
        const val SPLASH_DELAY_MS = 2_000L
    }
}

