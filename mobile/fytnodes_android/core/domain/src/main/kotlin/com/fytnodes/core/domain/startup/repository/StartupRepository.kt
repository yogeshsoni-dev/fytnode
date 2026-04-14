package com.fytnodes.core.domain.startup.repository

interface StartupRepository {
    suspend fun hasActiveSession(): Boolean
}

