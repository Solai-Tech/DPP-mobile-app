package client.sdk.myapplication.cirtag

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.text.font.FontWeight
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import client.sdk.myapplication.cirtag.data.ScannedProduct
import client.sdk.myapplication.cirtag.scanner.ScannerScreen
import client.sdk.myapplication.cirtag.screens.HistoryScreen
import client.sdk.myapplication.cirtag.screens.ProductDetailScreen
import client.sdk.myapplication.cirtag.ui.theme.MyApplicationCirtagTheme
import client.sdk.myapplication.cirtag.ui.theme.Primary
import client.sdk.myapplication.cirtag.ui.theme.PrimaryDark
import com.google.mlkit.vision.barcode.common.Barcode

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationCirtagTheme {
                CirtagApp()
            }
        }
    }
}

sealed class Screen(val route: String, val label: String) {
    data object Scanner : Screen("scanner", "Scanner")
    data object History : Screen("history", "History")
    data object ProductDetail : Screen("product_detail/{productId}", "Detail") {
        fun createRoute(productId: Long) = "product_detail/$productId"
    }
}

@Composable
fun CirtagApp(viewModel: MainViewModel = viewModel()) {
    val navController = rememberNavController()
    val products by viewModel.allProducts.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    val bottomBarScreens = listOf(Screen.Scanner, Screen.History)
    val showBottomBar = currentDestination?.route != Screen.ProductDetail.route

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = PrimaryDark,
                    contentColor = Color.White
                ) {
                    bottomBarScreens.forEach { screen ->
                        val selected = currentDestination?.hierarchy?.any { it.route == screen.route } == true
                        NavigationBarItem(
                            icon = {
                                Icon(
                                    imageVector = when (screen) {
                                        Screen.Scanner -> Icons.Filled.QrCodeScanner
                                        Screen.History -> Icons.Filled.History
                                        else -> Icons.Filled.QrCodeScanner
                                    },
                                    contentDescription = screen.label
                                )
                            },
                            label = {
                                Text(
                                    screen.label,
                                    fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal
                                )
                            },
                            selected = selected,
                            onClick = {
                                navController.navigate(screen.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = Color.White,
                                selectedTextColor = Color.White,
                                unselectedIconColor = Color.White.copy(alpha = 0.5f),
                                unselectedTextColor = Color.White.copy(alpha = 0.5f),
                                indicatorColor = Primary
                            )
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Scanner.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Scanner.route) {
                ScannerScreen(
                    isLoading = isLoading,
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
                    }
                )
            }

            composable(Screen.History.route) {
                HistoryScreen(
                    products = products,
                    onProductClick = { product ->
                        navController.navigate(Screen.ProductDetail.createRoute(product.id))
                    },
                    onDeleteProduct = { product ->
                        viewModel.deleteProduct(product)
                    }
                )
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
                        onBack = { navController.popBackStack() }
                    )
                }
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
