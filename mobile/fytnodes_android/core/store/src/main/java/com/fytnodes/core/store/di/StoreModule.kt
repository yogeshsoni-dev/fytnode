package com.fytnodes.core.store.di

import com.fytnodes.core.domain.store.SessionStore
import com.fytnodes.core.store.session.DefaultSessionStore
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
interface StoreModule {
    @Binds
    @Singleton
    fun bindSessionStore(store: DefaultSessionStore): SessionStore
}

