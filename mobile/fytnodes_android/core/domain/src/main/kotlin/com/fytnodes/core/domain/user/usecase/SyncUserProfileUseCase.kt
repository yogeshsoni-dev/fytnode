package com.fytnodes.core.domain.user.usecase

import com.fytnodes.core.common.result.AppResult
import com.fytnodes.core.domain.auth.repository.AuthRepository
import javax.inject.Inject

class SyncUserProfileUseCase @Inject constructor(
    private val authRepository: AuthRepository,
) {
    suspend operator fun invoke(): AppResult<Unit> = authRepository.syncUserProfile()
}

