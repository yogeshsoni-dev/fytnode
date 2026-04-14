package com.fytnodes.core.data.di

import com.fytnodes.core.data.repository.AuthRepositoryImpl
import com.fytnodes.core.data.repository.SignupRepositoryImpl
import com.fytnodes.core.data.repository.HomeRepositoryImpl
import com.fytnodes.core.data.repository.StartupRepositoryImpl
import com.fytnodes.core.domain.auth.repository.AuthRepository
import com.fytnodes.core.domain.home.repository.HomeRepository
import com.fytnodes.core.domain.signup.repository.SignupRepository
import com.fytnodes.core.domain.startup.repository.StartupRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
interface RepositoryModule {
    @Binds
    @Singleton
    fun bindAuthRepository(impl: AuthRepositoryImpl): AuthRepository

    @Binds
    @Singleton
    fun bindSignupRepository(impl: SignupRepositoryImpl): SignupRepository

    @Binds
    @Singleton
    fun bindHomeRepository(impl: HomeRepositoryImpl): HomeRepository

    @Binds
    @Singleton
    fun bindStartupRepository(impl: StartupRepositoryImpl): StartupRepository
}

