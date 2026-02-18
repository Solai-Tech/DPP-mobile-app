package client.sdk.myapplication.cirtag.util

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL

data class ProductData(
    val name: String = "",
    val description: String = "",
    val imageUrl: String = "",
    val productId: String = "",
    val price: String = "",
    val supplier: String = "",
    val skuId: String = "",
    val weight: String = "",
    val co2Total: String = "",
    val co2Details: String = "",
    val certifications: String = "",
    val datasheetUrl: String = ""
)

object ProductDataFetcher {

    suspend fun fetchProductData(urlString: String): ProductData = withContext(Dispatchers.IO) {
        try {
            val url = URL(urlString)
            val baseUrl = "${url.protocol}://${url.host}"
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "GET"
            connection.connectTimeout = 10000
            connection.readTimeout = 10000
            connection.setRequestProperty(
                "User-Agent",
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            )

            val html = connection.inputStream.bufferedReader().use { it.readText() }
            connection.disconnect()

            parseHtml(html, baseUrl)
        } catch (e: Exception) {
            ProductData()
        }
    }

    private fun parseHtml(html: String, baseUrl: String): ProductData {
        var name = ""
        var description = ""
        var imageUrl = ""
        var productId = ""
        var price = ""
        var supplier = ""
        var skuId = ""
        var weight = ""
        var co2Total = ""
        val co2Items = mutableListOf<String>()
        val certs = mutableListOf<String>()
        var datasheetUrl = ""

        // Product name from <h1>
        val namePatterns = listOf(
            """<h1[^>]*>(.*?)</h1>""",
            """"name"\s*:\s*"([^"]+)"""",
            """product_name['"]\s*:\s*['"]([^'"]+)"""
        )
        for (pattern in namePatterns) {
            val match = Regex(pattern, RegexOption.IGNORE_CASE).find(html)
            if (match != null) {
                val extracted = match.groupValues[1].replace(Regex("<[^>]+>"), "").trim()
                if (extracted.isNotEmpty() && extracted.length < 200) {
                    name = extracted
                    break
                }
            }
        }

        // Product image
        val imgMatch = Regex("""product_images/([^'"&\s<>]+)""", RegexOption.IGNORE_CASE).find(html)
        if (imgMatch != null) {
            imageUrl = "$baseUrl/dpp/media/product_images/${imgMatch.groupValues[1]}"
        }

        // Product ID
        val idMatch = Regex("""Product ID[:\s]*</?\w*>?\s*(\d+)""", RegexOption.IGNORE_CASE).find(html)
            ?: Regex("""product_id['"]\s*:\s*['"]?(\d+)""", RegexOption.IGNORE_CASE).find(html)
        if (idMatch != null) productId = idMatch.groupValues[1].trim()

        // Description
        val descMatch = Regex(
            """Product Description.*?<(?:p|div|textarea)[^>]*>(.*?)</(?:p|div|textarea)>""",
            setOf(RegexOption.IGNORE_CASE, RegexOption.DOT_MATCHES_ALL)
        ).find(html)
        if (descMatch != null) {
            description = descMatch.groupValues[1].replace(Regex("<[^>]+>"), "").trim()
        }

        // Price
        val priceMatch = Regex("""Price[:\s]*</?\w*>?\s*([\d.,]+\s*\w{2,5})""", RegexOption.IGNORE_CASE).find(html)
        if (priceMatch != null) price = priceMatch.groupValues[1].trim()

        // Supplier
        val supplierMatch = Regex("""Supplier Name[:\s]*</?\w*>?\s*([A-Za-z0-9\s&.,'-]+?)(?:<|$)""", RegexOption.IGNORE_CASE).find(html)
        if (supplierMatch != null) supplier = supplierMatch.groupValues[1].trim()

        // SKU
        val skuMatch = Regex("""SKU ID[:\s]*</?\w*>?\s*([A-Za-z0-9\-]+)""", RegexOption.IGNORE_CASE).find(html)
        if (skuMatch != null) skuId = skuMatch.groupValues[1].trim()

        // Weight
        val weightMatch = Regex("""Weight[:\s]*</?\w*>?\s*([\d.,]+\s*\w{1,5})""", RegexOption.IGNORE_CASE).find(html)
        if (weightMatch != null) weight = weightMatch.groupValues[1].trim()

        // Total CO2
        val co2TotalMatch = Regex("""([\d.,]+)\s*(?:Kg|kg)\s*CO""", RegexOption.IGNORE_CASE).find(html)
        if (co2TotalMatch != null) co2Total = "${co2TotalMatch.groupValues[1]} Kg CO₂ Eqv"

        // CO2 breakdown items
        val co2Patterns = listOf(
            "Raw Material" to """Raw Material[^<]*?(\d+\.?\d*)\s*(?:Kg|kg)\s*CO""",
            "Shipping & Transport" to """Shipping[^<]*?(\d+\.?\d*)\s*(?:Kg|kg)\s*CO""",
            "Transportation" to """Transportation[^<]*?(\d+\.?\d*)\s*(?:Kg|kg)\s*CO""",
            "Manufacturing" to """Manufacturing[^<]*?(\d+\.?\d*)\s*(?:Kg|kg)\s*CO""",
            "Usage (5 years)" to """Usage[^<]*?(\d+\.?\d*)\s*(?:Kg|kg)\s*CO""",
            "End of Life" to """End of Life[^<]*?(\d+\.?\d*)\s*(?:Kg|kg|kg\s*)CO"""
        )
        for ((label, pattern) in co2Patterns) {
            val match = Regex(pattern, RegexOption.IGNORE_CASE).find(html)
            if (match != null) {
                co2Items.add("$label:${match.groupValues[1]} Kg CO₂")
            }
        }

        // Certifications
        val certPatterns = listOf("ISO 14001", "BPA Free", "FCC Approved", "Cradle to Cradle", "EU Compliant")
        for (cert in certPatterns) {
            if (html.contains(cert, ignoreCase = true)) {
                certs.add(cert)
            }
        }

        // Verified Product
        if (html.contains("Verified Product", ignoreCase = true)) {
            certs.add(0, "Verified Product")
        }

        // Datasheet PDF URL
        val pdfMatch = Regex("""href=["']([^"']*\.pdf[^"']*)["']""", RegexOption.IGNORE_CASE).find(html)
        if (pdfMatch != null) {
            val pdf = pdfMatch.groupValues[1]
            datasheetUrl = if (pdf.startsWith("http")) pdf else "$baseUrl$pdf"
        }

        return ProductData(
            name = name,
            description = description,
            imageUrl = imageUrl,
            productId = productId,
            price = price,
            supplier = supplier,
            skuId = skuId,
            weight = weight,
            co2Total = co2Total,
            co2Details = co2Items.joinToString(","),
            certifications = certs.joinToString(","),
            datasheetUrl = datasheetUrl
        )
    }
}
