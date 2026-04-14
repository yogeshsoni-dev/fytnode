package com.fytnodes.core.domain.home.repository

import com.fytnodes.core.common.result.AppResult
import com.fytnodes.core.domain.home.model.HomeDashboard

interface HomeRepository {
    suspend fun getHomeDashboard(): AppResult<HomeDashboard>
}

