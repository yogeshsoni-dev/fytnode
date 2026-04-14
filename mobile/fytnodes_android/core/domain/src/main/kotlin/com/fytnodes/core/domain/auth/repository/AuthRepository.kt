package com.fytnodes.core.domain.auth.repository

import com.fytnodes.core.common.result.AppResult
import com.fytnodes.core.domain.auth.model.AuthToken
import com.fytnodes.core.domain.login.model.LoginRequest
import com.fytnodes.core.domain.signup.model.SignupRequest
import com.fytnodes.core.domain.signup.model.SignupResult
import com.fytnodes.core.domain.user.model.User
import kotlinx.coroutines.flow.Flow

interface AuthRepository {
    suspend fun signup(request: SignupRequest): AppResult<SignupResult>
    suspend fun login(request: LoginRequest): AppResult<AuthToken>
    suspend fun syncUserProfile(): AppResult<Unit>
    fun getUserProfile(): Flow<User?>
}

