package client.sdk.myapplication.cirtag.ui.theme

import androidx.compose.ui.graphics.Color

// Primary Green
val CirtagGreen = Color(0xFF16A34A)
val CirtagGreenLight = Color(0xFF22C55E)
val CirtagGreenPale = Color(0xFFDCFCE7)
val CirtagGreenMedium = Color(0xFF4ADE80)

// Dark theme colors
val CirtagDarkBg = Color(0xFF071A09)
val CirtagDarkSurface = Color(0xFF0D2410)
val CirtagDarkCard = Color(0xFF0F2D12)
val CirtagDarkGradient1 = Color(0xFF0F3512)
val CirtagDarkGradient2 = Color(0xFF1A5E16)
val CirtagDarkGradient3 = Color(0xFF22881A)

// Neutral
val OffWhite = Color(0xFFF7FAF7)
val Gray50 = Color(0xFFF9FBF9)
val Gray100 = Color(0xFFF0F4F0)
val Gray200 = Color(0xFFE2E8E2)
val Gray300 = Color(0xFFD1D9D1)
val Gray400 = Color(0xFF9CB09C)
val Gray500 = Color(0xFF6B8A6B)
val Gray600 = Color(0xFF4A6B4A)
val TextDark = Color(0xFF0F2010)
val TextSecondary = Color(0xFF4A6B4A)

// Status colors
val AmberStatus = Color(0xFFF59E0B)
val AmberPale = Color(0xFFFEF3C7)
val RedStatus = Color(0xFFEF4444)
val RedPale = Color(0xFFFEE2E2)
val BlueStatus = Color(0xFF3B82F6)
val BluePale = Color(0xFFDBEAFE)

// Legacy colors (kept for compatibility)
val Primary = CirtagGreen
val PrimaryDark = CirtagDarkBg
val PrimaryLight = CirtagGreenLight
val PrimaryContainer = CirtagGreenPale
val OnPrimaryContainer = TextDark

val Secondary = Color(0xFF1A237E)
val SecondaryContainer = Color(0xFFC5CAE9)

val Accent = CirtagGreenMedium
val AccentLight = CirtagGreenPale

val BackgroundLight = OffWhite
val SurfaceLight = Color.White
val BackgroundDark = CirtagDarkBg
val SurfaceDark = CirtagDarkSurface

val Success = CirtagGreen
val Warning = AmberStatus
val Error = RedStatus

val Co2Green = CirtagGreen
val Co2Banner = CirtagGreenPale
val Co2BannerText = TextDark

val CardDark = CirtagDarkCard
