package com.fytnodes.core.domain.startup.usecase

import com.fytnodes.core.domain.startup.model.StartupDestination
import com.fytnodes.core.domain.startup.repository.StartupRepository
import javax.inject.Inject

class ResolveStartupDestinationUseCase @Inject constructor(
    private val startupRepository: StartupRepository,
) {
    suspend operator fun invoke(): StartupDestination =
        if (startupRepository.hasActiveSession()) StartupDestination.HOME else StartupDestination.LOGIN
}

