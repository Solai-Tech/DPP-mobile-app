package client.sdk.myapplication.cirtag.util

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL

object WebTitleFetcher {
    suspend fun fetchTitle(urlString: String): String? = withContext(Dispatchers.IO) {
        try {
            val url = URL(urlString)
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "GET"
            connection.connectTimeout = 5000
            connection.readTimeout = 5000
            connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")

            val html = connection.inputStream.bufferedReader().use { it.readText() }
            connection.disconnect()

            // Extract <title> tag
            val titleRegex = "<title[^>]*>(.*?)</title>".toRegex(RegexOption.IGNORE_CASE)
            val match = titleRegex.find(html)
            match?.groupValues?.get(1)?.trim()?.takeIf { it.isNotEmpty() }
        } catch (e: Exception) {
            null
        }
    }
}
