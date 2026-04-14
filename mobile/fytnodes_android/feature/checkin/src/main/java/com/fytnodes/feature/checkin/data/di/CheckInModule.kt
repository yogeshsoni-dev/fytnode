package com.fytnodes.feature.checkin.data.di

import com.fytnodes.feature.checkin.data.remote.CheckInApiService
import com.fytnodes.feature.checkin.data.repository.CheckInRepositoryImpl
import com.fytnodes.feature.checkin.domain.repository.CheckInRepository
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton
import retrofit2.Retrofit

@Module
@InstallIn(SingletonComponent::class)
interface CheckInBindingsModule {
    @Binds
    @Singleton
    fun bindCheckInRepository(impl: CheckInRepositoryImpl): CheckInRepository
}

@Module
@InstallIn(SingletonComponent::class)
object CheckInApiModule {
    @Provides
    @Singleton
    fun provideCheckInApiService(retrofit: Retrofit): CheckInApiService =
        retrofit.create(CheckInApiService::class.java)
}
