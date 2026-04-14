package com.fytnodes.core.data.repository

import com.fytnodes.core.common.result.AppResult
import com.fytnodes.core.data.di.IoDispatcher
import com.fytnodes.core.domain.home.model.HomeDashboard
import com.fytnodes.core.domain.home.model.HomeStat
import com.fytnodes.core.domain.home.repository.HomeRepository
import com.fytnodes.core.domain.store.SessionStore
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.withContext

@Singleton
class HomeRepositoryImpl @Inject constructor(
    private val sessionStore: SessionStore,
    @IoDispatcher private val ioDispatcher: CoroutineDispatcher,
) : HomeRepository {
    override suspend fun getHomeDashboard(): AppResult<HomeDashboard> = withContext(ioDispatcher) {
        AppResult.Success(
            HomeDashboard(
                welcomeName = sessionStore.name ?: "Warrior",
                stats = listOf(
                    HomeStat(
                        key = "calories",
                        label = "Calories",
                        value = "2,450",
                        unit = "kcal",
                        goal = "/ 3000",
                        progress = 0.82f,
                    ),
                    HomeStat(
                        key = "steps",
                        label = "Steps",
                        value = "8,234",
                        unit = "steps",
                        goal = "/ 10000",
                        progress = 0.82f,
                    ),
                ),
            ),
        )
    }
}

