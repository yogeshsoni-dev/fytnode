package com.fytnodes.core.domain.store

interface SessionStore {
    var accessToken: String?
    var email: String?
    var name: String?
    suspend fun clear()
}

