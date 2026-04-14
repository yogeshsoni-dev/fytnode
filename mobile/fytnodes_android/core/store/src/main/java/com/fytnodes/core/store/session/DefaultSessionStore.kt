package com.fytnodes.core.store.session

import android.content.Context
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStoreFile
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import com.fytnodes.core.domain.store.SessionStore
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking
import java.io.IOException

@Singleton
class DefaultSessionStore @Inject constructor(
    @ApplicationContext private val context: Context,
) : SessionStore {
    private val dataStore = PreferenceDataStoreFactory.create(
        produceFile = { context.preferencesDataStoreFile("fytnodes_store") },
    )

    override var accessToken: String?
        get() = runBlocking { getString(TOKEN_KEY) }
        set(value) {
            runBlocking {
                dataStore.edit { prefs ->
                    if (value.isNullOrBlank()) prefs.remove(TOKEN_KEY) else prefs[TOKEN_KEY] = value
                }
            }
        }

    override var email: String?
        get() = runBlocking { getString(EMAIL_KEY) }
        set(value) {
            runBlocking {
                dataStore.edit { prefs ->
                    if (value.isNullOrBlank()) prefs.remove(EMAIL_KEY) else prefs[EMAIL_KEY] = value
                }
            }
        }

    override var name: String?
        get() = runBlocking { getString(NAME_KEY) }
        set(value) {
            runBlocking {
                dataStore.edit { prefs ->
                    if (value.isNullOrBlank()) prefs.remove(NAME_KEY) else prefs[NAME_KEY] = value
                }
            }
        }

    override suspend fun clear() {
        dataStore.edit { it.clear() }
    }

    private suspend fun getString(key: Preferences.Key<String>): String? {
        return dataStore.data
            .catch { if (it is IOException) emit(emptyPreferences()) else throw it }
            .map { prefs -> prefs[key] }
            .first()
    }

    private companion object {
        val TOKEN_KEY = stringPreferencesKey("token")
        val EMAIL_KEY = stringPreferencesKey("email")
        val NAME_KEY = stringPreferencesKey("name")
    }
}

