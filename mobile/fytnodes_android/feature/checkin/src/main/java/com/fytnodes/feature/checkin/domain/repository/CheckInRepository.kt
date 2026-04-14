package com.fytnodes.feature.checkin.domain.repository

import com.fytnodes.core.common.result.AppResult
import com.fytnodes.feature.checkin.domain.model.CheckInResult
import com.fytnodes.feature.checkin.domain.model.CheckOutResult

interface CheckInRepository {
    suspend fun checkIn(): AppResult<CheckInResult>
    suspend fun checkOut(attendanceId: Int): AppResult<CheckOutResult>
}
