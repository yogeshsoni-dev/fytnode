package com.fytnodes.feature.checkin.domain.usecase

import com.fytnodes.core.common.result.AppResult
import com.fytnodes.feature.checkin.domain.model.CheckInResult
import com.fytnodes.feature.checkin.domain.repository.CheckInRepository
import javax.inject.Inject

class CheckInUseCase @Inject constructor(
    private val repository: CheckInRepository,
) {
    suspend operator fun invoke(): AppResult<CheckInResult> = repository.checkIn()
}
