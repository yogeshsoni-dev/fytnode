package com.fytnodes.core.domain.user.usecase

import com.fytnodes.core.domain.auth.repository.AuthRepository
import com.fytnodes.core.domain.user.model.User
import javax.inject.Inject
import kotlinx.coroutines.flow.Flow

class GetUserProfileUseCase @Inject constructor(
    private val authRepository: AuthRepository,
) {
    operator fun invoke(): Flow<User?> = authRepository.getUserProfile()
}

