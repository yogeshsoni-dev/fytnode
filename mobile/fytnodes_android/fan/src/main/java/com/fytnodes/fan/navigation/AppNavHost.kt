package com.fytnodes.fan.navigation

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.currentBackStackEntryAsState
import com.fytnodes.core.navigation.bottomNavItems
import com.fytnodes.core.ui.components.BottomNav
import com.fytnodes.core.ui.components.AppLayout
import com.fytnodes.core.ui.layout.ScreenContainer
import androidx.compose.material3.Text
import com.fytnodes.core.ui.theme.TextPrimary
import com.fytnodes.feature.home.DASHBOARD_ROUTE
import com.fytnodes.feature.home.TERRITORY_ROUTE
import com.fytnodes.feature.home.COMMUNITY_ROUTE
import com.fytnodes.feature.home.dashboardScreen
import com.fytnodes.feature.login.LOGIN_ROUTE
import com.fytnodes.feature.login.LoginNavigation
import com.fytnodes.feature.login.loginScreen
import com.fytnodes.feature.onboarding.presentation.ONBOARDING_ROUTE
import com.fytnodes.feature.onboarding.presentation.OnboardingNavigation
import com.fytnodes.feature.onboarding.presentation.onboardingScreen
import com.fytnodes.feature.signup.SIGNUP_ROUTE
import com.fytnodes.feature.signup.SignupNavigation
import com.fytnodes.feature.signup.signupScreen
import com.fytnodes.feature.profile.presentation.PROFILE_ROUTE
import com.fytnodes.feature.profile.presentation.profileScreen
import com.fytnodes.feature.splash.SPLASH_ROUTE
import com.fytnodes.feature.splash.SplashNavigation
import com.fytnodes.feature.splash.splashScreen

@Composable
fun AppNavHost(
    navController: NavHostController,
) {
    val navBackStackEntry = navController.currentBackStackEntryAsState().value
    val currentRoute = navBackStackEntry?.destination?.route
    val tabRoutes = setOf(DASHBOARD_ROUTE, TERRITORY_ROUTE, COMMUNITY_ROUTE, PROFILE_ROUTE)
    val showBottomNav = currentRoute in tabRoutes

    if (showBottomNav && currentRoute != DASHBOARD_ROUTE) {
        BackHandler {
            navController.navigate(DASHBOARD_ROUTE) {
                popUpTo(DASHBOARD_ROUTE) { inclusive = false }
                launchSingleTop = true
            }
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        NavHost(navController = navController, startDestination = SPLASH_ROUTE) {
            splashScreen { navigation ->
                when (navigation) {
                    SplashNavigation.Onboarding -> navController.navigate(ONBOARDING_ROUTE) {
                        popUpTo(SPLASH_ROUTE) { inclusive = true }
                        launchSingleTop = true
                    }
                    SplashNavigation.Dashboard -> navController.navigate(DASHBOARD_ROUTE) {
                        popUpTo(SPLASH_ROUTE) { inclusive = true }
                        launchSingleTop = true
                    }
                }
            }

            onboardingScreen { navigation ->
                when (navigation) {
                    OnboardingNavigation.Login -> navController.navigate(LOGIN_ROUTE) {
                        popUpTo(ONBOARDING_ROUTE) { inclusive = true }
                        launchSingleTop = true
                    }
                }
            }

            loginScreen { navigation ->
                when (navigation) {
                    LoginNavigation.Signup -> navController.navigate(SIGNUP_ROUTE)
                    LoginNavigation.Dashboard -> navController.navigate(DASHBOARD_ROUTE) {
                        popUpTo(LOGIN_ROUTE) { inclusive = true }
                        launchSingleTop = true
                    }
                }
            }

            signupScreen { navigation ->
                when (navigation) {
                    SignupNavigation.Back -> navController.popBackStack()
                    SignupNavigation.Login -> navController.navigate(LOGIN_ROUTE) {
                        popUpTo(SIGNUP_ROUTE) { inclusive = true }
                        launchSingleTop = true
                    }
                }
            }

            dashboardScreen(onNavigateToActivity = {
                navController.navigate(TERRITORY_ROUTE) {
                    popUpTo(DASHBOARD_ROUTE) { inclusive = false }
                    launchSingleTop = true
                }
            })

            tabPlaceholderScreen(
                route = TERRITORY_ROUTE,
                title = "Territory Run",
            )
            tabPlaceholderScreen(
                route = COMMUNITY_ROUTE,
                title = "Community",
            )
            profileScreen(
                onLogout = {
                    navController.navigate(LOGIN_ROUTE) {
                        popUpTo(DASHBOARD_ROUTE) { inclusive = true }
                        launchSingleTop = true
                    }
                },
            )
        }

        if (showBottomNav) {
            BottomNav(
                items = bottomNavItems,
                selectedRoute = currentRoute.orEmpty(),
                onItemSelected = { item ->
                    navController.navigate(item.route) {
                        popUpTo(DASHBOARD_ROUTE) { inclusive = false }
                        launchSingleTop = true
                    }
                },
                modifier = Modifier.align(Alignment.BottomCenter),
            )
        }
    }
}

private fun NavGraphBuilder.tabPlaceholderScreen(
    route: String,
    title: String,
) {
    composable(route = route) {
        AppLayout {
            ScreenContainer(includeBottomNavPadding = true) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = title,
                        color = TextPrimary,
                    )
                }
            }
        }
    }
}

