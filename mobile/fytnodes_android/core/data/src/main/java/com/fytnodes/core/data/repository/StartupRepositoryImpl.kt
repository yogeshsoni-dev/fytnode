package com.fytnodes.core.data.repository

import com.fytnodes.core.domain.startup.repository.StartupRepository
import com.fytnodes.core.domain.store.SessionStore
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class StartupRepositoryImpl @Inject constructor(
    private val sessionStore: SessionStore,
) : StartupRepository {
    override suspend fun hasActiveSession(): Boolean = !sessionStore.accessToken.isNullOrBlank()
}

