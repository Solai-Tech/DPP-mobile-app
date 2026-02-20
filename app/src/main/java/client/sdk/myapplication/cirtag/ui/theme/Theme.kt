package client.sdk.myapplication.cirtag.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = CirtagGreen,
    onPrimary = Color.White,
    primaryContainer = CirtagGreenPale,
    onPrimaryContainer = TextDark,
    secondary = CirtagGreenLight,
    secondaryContainer = CirtagGreenPale,
    tertiary = CirtagGreenMedium,
    tertiaryContainer = CirtagGreenPale,
    background = OffWhite,
    surface = Color.White,
    error = RedStatus,
    onBackground = TextDark,
    onSurface = TextDark,
    onSecondary = Color.White,
    onTertiary = Color.White,
    surfaceVariant = Gray100,
    onSurfaceVariant = TextSecondary
)

private val DarkColorScheme = darkColorScheme(
    primary = CirtagGreenLight,
    onPrimary = CirtagDarkBg,
    primaryContainer = CirtagDarkGradient1,
    onPrimaryContainer = CirtagGreenPale,
    secondary = CirtagGreenMedium,
    secondaryContainer = CirtagDarkGradient2,
    tertiary = CirtagGreenLight,
    tertiaryContainer = CirtagDarkGradient1,
    background = CirtagDarkBg,
    surface = CirtagDarkSurface,
    error = RedStatus,
    onBackground = Color.White,
    onSurface = Color.White,
    onSecondary = CirtagDarkBg,
    onTertiary = CirtagDarkBg,
    surfaceVariant = CirtagDarkGradient1,
    onSurfaceVariant = Gray400
)

@Composable
fun MyApplicationCirtagTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = CirtagDarkBg.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
