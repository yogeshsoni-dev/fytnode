package com.fytnodes.core.data.di

import com.fytnodes.core.data.remote.api.AuthApiService
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton
import retrofit2.Retrofit

@Module
@InstallIn(SingletonComponent::class)
object AuthServiceModule {
    @Provides
    @Singleton
    fun provideAuthApiService(
        retrofit: Retrofit,
    ): AuthApiService = retrofit.create(AuthApiService::class.java)
}

