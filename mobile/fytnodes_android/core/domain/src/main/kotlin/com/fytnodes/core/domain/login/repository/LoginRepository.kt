package com.fytnodes.core.domain.login.repository

import com.fytnodes.core.common.result.AppResult
import com.fytnodes.core.domain.login.model.LoginRequest
import com.fytnodes.core.domain.login.model.LoginUser

interface LoginRepository {
    suspend fun login(request: LoginRequest): AppResult<LoginUser>
}

