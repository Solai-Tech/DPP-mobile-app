package client.sdk.myapplication.cirtag

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import client.sdk.myapplication.cirtag.data.AppDatabase
import client.sdk.myapplication.cirtag.data.ScannedProduct
import client.sdk.myapplication.cirtag.util.ProductDataFetcher
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val dao = AppDatabase.getDatabase(application).scannedProductDao()

    val allProducts = dao.getAllProducts()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()

    fun scanAndSaveProduct(product: ScannedProduct, onComplete: (Long) -> Unit) {
        viewModelScope.launch {
            _isLoading.value = true

            val isUrl = product.rawValue.startsWith("http://") || product.rawValue.startsWith("https://")

            if (isUrl) {
                // Fetch product data first, then save
                val data = ProductDataFetcher.fetchProductData(product.rawValue)
                val enriched = product.copy(
                    productName = data.name,
                    productDescription = data.description,
                    imageUrl = data.imageUrl,
                    productId = data.productId,
                    price = data.price,
                    supplier = data.supplier,
                    skuId = data.skuId,
                    weight = data.weight,
                    co2Total = data.co2Total,
                    co2Details = data.co2Details,
                    certifications = data.certifications,
                    datasheetUrl = data.datasheetUrl
                )
                val id = dao.insertProduct(enriched)
                _isLoading.value = false
                onComplete(id)
            } else {
                val id = dao.insertProduct(product)
                _isLoading.value = false
                onComplete(id)
            }
        }
    }

    fun deleteProduct(product: ScannedProduct) {
        viewModelScope.launch {
            dao.deleteProduct(product)
        }
    }

    suspend fun getProductById(id: Long): ScannedProduct? {
        return dao.getProductById(id)
    }
}
