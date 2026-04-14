package com.fytnodes.core.domain.home.usecase

import com.fytnodes.core.common.result.AppResult
import com.fytnodes.core.domain.home.model.HomeDashboard
import com.fytnodes.core.domain.home.repository.HomeRepository
import javax.inject.Inject

class GetHomeDashboardUseCase @Inject constructor(
    private val homeRepository: HomeRepository,
) {
    suspend operator fun invoke(): AppResult<HomeDashboard> = homeRepository.getHomeDashboard()
}

