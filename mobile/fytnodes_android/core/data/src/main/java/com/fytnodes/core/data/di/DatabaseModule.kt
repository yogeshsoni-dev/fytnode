package com.fytnodes.core.data.di

import android.content.Context
import androidx.room.Room
import com.fytnodes.core.database.FytNodesDatabase
import com.fytnodes.core.database.dao.SessionDao
import com.fytnodes.core.database.dao.UserDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): FytNodesDatabase =
        Room.databaseBuilder(context, FytNodesDatabase::class.java, "fytnodes.db")
            .fallbackToDestructiveMigration()
            .build()

    @Provides
    fun provideSessionDao(db: FytNodesDatabase): SessionDao = db.sessionDao()

    @Provides
    fun provideUserDao(db: FytNodesDatabase): UserDao = db.userDao()
}

