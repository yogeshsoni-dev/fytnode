package com.fytnodes.core.domain.signup.repository

import com.fytnodes.core.common.result.AppResult
import com.fytnodes.core.domain.login.model.LoginUser
import com.fytnodes.core.domain.signup.model.SignupRequest

interface SignupRepository {
    suspend fun signup(request: SignupRequest): AppResult<LoginUser>
}

