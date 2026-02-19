package client.sdk.myapplication.cirtag

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PhotoCamera
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.outlined.ConfirmationNumber
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import client.sdk.myapplication.cirtag.data.ScannedProduct
import client.sdk.myapplication.cirtag.scanner.ScannerScreen
import client.sdk.myapplication.cirtag.screens.HomeScreen
import client.sdk.myapplication.cirtag.screens.ProductDetailScreen
import client.sdk.myapplication.cirtag.screens.ProfileScreen
import client.sdk.myapplication.cirtag.screens.TicketsScreen
import client.sdk.myapplication.cirtag.ui.theme.CirtagDarkBg
import client.sdk.myapplication.cirtag.ui.theme.CirtagGreen
import client.sdk.myapplication.cirtag.ui.theme.CirtagGreenLight
import client.sdk.myapplication.cirtag.ui.theme.MyApplicationCirtagTheme
import com.google.mlkit.vision.barcode.common.Barcode

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationCirtagTheme(darkTheme = false) {
                CirtagApp()
            }
        }
    }
}

sealed class Screen(val route: String, val label: String, val icon: ImageVector) {
    data object Home : Screen("home", "Home", Icons.Filled.Home)
    data object Scan : Screen("scan", "Scan", Icons.Filled.PhotoCamera)
    data object Tickets : Screen("tickets", "Tickets", Icons.Filled.Public)
    data object Profile : Screen("profile", "Profile", Icons.Outlined.Person)
    data object ProductDetail : Screen("product_detail/{productId}", "Detail", Icons.Filled.Home) {
        fun createRoute(productId: Long) = "product_detail/$productId"
    }
    data object SampleProductLifecycle : Screen("sample_product_lifecycle", "Product Lifecycle", Icons.Filled.Home)
}

@Composable
fun CirtagApp(viewModel: MainViewModel = viewModel()) {
    val navController = rememberNavController()
    val products by viewModel.allProducts.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    // Bottom navigation bar screens
    val bottomBarScreens = listOf(Screen.Home, Screen.Scan, Screen.Tickets, Screen.Profile)
    val showBottomBar = currentDestination?.route != Screen.ProductDetail.route &&
            currentDestination?.route != Screen.SampleProductLifecycle.route

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = CirtagDarkBg,
                    contentColor = Color.White,
                    tonalElevation = 0.dp,
                    modifier = Modifier.background(CirtagDarkBg)
                ) {
                    bottomBarScreens.forEach { screen ->
                        val selected = currentDestination?.route == screen.route
                        NavigationBarItem(
                            icon = {
                                Icon(
                                    imageVector = screen.icon,
                                    contentDescription = screen.label,
                                    modifier = Modifier.size(26.dp)
                                )
                            },
                            label = {
                                Text(
                                    screen.label,
                                    fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal,
                                    fontSize = 11.sp
                                )
                            },
                            selected = selected,
                            onClick = {
                                if (screen.route == Screen.Home.route) {
                                    // For Home, pop back to it instead of navigating
                                    navController.popBackStack(Screen.Home.route, inclusive = false)
                                } else {
                                    navController.navigate(screen.route) {
                                        popUpTo(Screen.Home.route) {
                                            saveState = true
                                        }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = CirtagGreenLight,
                                selectedTextColor = CirtagGreenLight,
                                unselectedIconColor = Color.White.copy(alpha = 0.5f),
                                unselectedTextColor = Color.White.copy(alpha = 0.5f),
                                indicatorColor = CirtagGreen.copy(alpha = 0.2f)
                            )
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Home.route) {
                HomeScreen(
                    onProductsHistoryClick = { navController.navigate(Screen.Scan.route) },
                    onLifeCycleClick = { navController.navigate(Screen.SampleProductLifecycle.route) }
                )
            }

            composable(Screen.Scan.route) {
                ScannerScreen(
                    isLoading = isLoading,
                    products = products,
                    onBarcodeScanned = { barcode ->
                        val product = ScannedProduct(
                            rawValue = barcode.rawValue ?: "",
                            displayValue = barcode.displayValue ?: barcode.rawValue ?: "",
                            format = getBarcodeFormatName(barcode.format),
                            type = getBarcodeTypeName(barcode.valueType)
                        )
                        viewModel.scanAndSaveProduct(product) { savedId ->
                            navController.navigate(Screen.ProductDetail.createRoute(savedId))
                        }
                    },
                    onProductClick = { product ->
                        navController.navigate(Screen.ProductDetail.createRoute(product.id))
                    }
                )
            }

            composable(Screen.Tickets.route) {
                TicketsScreen()
            }

            composable(Screen.Profile.route) {
                ProfileScreen()
            }

            composable(Screen.ProductDetail.route) { backStackEntry ->
                val productId = backStackEntry.arguments?.getString("productId")?.toLongOrNull()
                var product by remember { mutableStateOf<ScannedProduct?>(null) }

                LaunchedEffect(productId) {
                    productId?.let {
                        product = viewModel.getProductById(it)
                    }
                }

                product?.let { p ->
                    ProductDetailScreen(
                        product = p,
                        onBack = { navController.popBackStack() },
                        onGetSupport = { navController.navigate(Screen.Tickets.route) },
                        onRaiseTicket = { navController.navigate(Screen.Tickets.route) }
                    )
                }
            }

            composable(Screen.SampleProductLifecycle.route) {
                val sampleProduct = ScannedProduct(
                    id = 0,
                    rawValue = "https://example.com/dpp/eco-packaging-unit-pro",
                    displayValue = "Eco Packaging Unit Pro",
                    format = "QR Code",
                    type = "Product",
                    productName = "Eco Packaging\nUnit Pro",
                    productDescription = "Sustainable packaging solution",
                    imageUrl = "",
                    productId = "DPP-2024-ECO-00412",
                    price = "",
                    supplier = "GreenPack AB",
                    skuId = "204",
                    weight = "",
                    co2Total = "0.4t",
                    co2Details = "Raw Material:0.18,Manufacturing:0.12,Transport:0.10",
                    certifications = "",
                    datasheetUrl = "",
                    scannedAt = System.currentTimeMillis()
                )
                ProductDetailScreen(
                    product = sampleProduct,
                    onBack = { navController.popBackStack() },
                    onGetSupport = { navController.navigate(Screen.Tickets.route) },
                    onRaiseTicket = { navController.navigate(Screen.Tickets.route) }
                )
            }
        }
    }
}

private fun getBarcodeFormatName(format: Int): String {
    return when (format) {
        Barcode.FORMAT_QR_CODE -> "QR Code"
        Barcode.FORMAT_AZTEC -> "Aztec"
        Barcode.FORMAT_CODABAR -> "Codabar"
        Barcode.FORMAT_CODE_39 -> "Code 39"
        Barcode.FORMAT_CODE_93 -> "Code 93"
        Barcode.FORMAT_CODE_128 -> "Code 128"
        Barcode.FORMAT_DATA_MATRIX -> "Data Matrix"
        Barcode.FORMAT_EAN_8 -> "EAN-8"
        Barcode.FORMAT_EAN_13 -> "EAN-13"
        Barcode.FORMAT_ITF -> "ITF"
        Barcode.FORMAT_PDF417 -> "PDF417"
        Barcode.FORMAT_UPC_A -> "UPC-A"
        Barcode.FORMAT_UPC_E -> "UPC-E"
        else -> "Unknown"
    }
}

private fun getBarcodeTypeName(type: Int): String {
    return when (type) {
        Barcode.TYPE_URL -> "URL"
        Barcode.TYPE_TEXT -> "Text"
        Barcode.TYPE_CONTACT_INFO -> "Contact"
        Barcode.TYPE_EMAIL -> "Email"
        Barcode.TYPE_PHONE -> "Phone"
        Barcode.TYPE_SMS -> "SMS"
        Barcode.TYPE_WIFI -> "WiFi"
        Barcode.TYPE_GEO -> "Location"
        Barcode.TYPE_CALENDAR_EVENT -> "Calendar Event"
        Barcode.TYPE_PRODUCT -> "Product"
        Barcode.TYPE_ISBN -> "ISBN"
        Barcode.TYPE_DRIVER_LICENSE -> "Driver License"
        else -> "Other"
    }
}
