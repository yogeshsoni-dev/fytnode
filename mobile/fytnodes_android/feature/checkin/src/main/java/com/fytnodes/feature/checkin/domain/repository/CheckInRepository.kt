package com.fytnodes.feature.checkin.domain.repository

import com.fytnodes.core.common.result.AppResult
import com.fytnodes.feature.checkin.domain.model.CheckInResult

interface CheckInRepository {
    suspend fun checkIn(): AppResult<CheckInResult>
}
