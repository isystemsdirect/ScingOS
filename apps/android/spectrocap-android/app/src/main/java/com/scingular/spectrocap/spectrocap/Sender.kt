package com.scingular.spectrocap.spectrocap

import android.content.Context
import android.util.Base64
import org.json.JSONObject
import java.io.File
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

object Sender {

  // Endpoint stored in SharedPreferences via UI; defaults to HTTPS on 9443
  fun defaultEndpoint(): String = "https://192.168.0.37:9443/ingest"

  // Build endpoint dynamically from components
  fun buildEndpoint(host: String, port: String, useHttps: Boolean): String {
    val protocol = if (useHttps) "https" else "http"
    return "$protocol://$host:$port/ingest"
  }

  fun sendOne(ctx: Context, endpoint: String, item: QueueItem): Pair<Boolean, String> {
    try {
      val f = File(item.filePath)
      if (!f.exists()) return Pair(false, "Missing file: ${item.filePath}")
      val bytes = f.readBytes()
      val b64 = Base64.encodeToString(bytes, Base64.NO_WRAP)

      val body = JSONObject()
      body.put("id", item.id)
      body.put("pngBase64", b64)

      val url = URL(endpoint)
      val con = (url.openConnection() as HttpURLConnection).apply {
        requestMethod = "POST"
        connectTimeout = 8000
        readTimeout = 15000
        doOutput = true
        setRequestProperty("Content-Type", "application/json")
      }

      OutputStreamWriter(con.outputStream, Charsets.UTF_8).use { it.write(body.toString()) }

      val code = con.responseCode
      val ok = (code in 200..299)
      val msg = "HTTP $code"
      con.disconnect()
      return Pair(ok, msg)
    } catch (t: Throwable) {
      return Pair(false, t.message ?: t.toString())
    }
  }

  fun sendAllQueued(ctx: Context, endpoint: String): Pair<Int, Int> {
    val items = SendQueue.load(ctx)
    var sentNow = 0
    var failedNow = 0

    for (it in items) {
      if (it.status != "QUEUED") continue
      it.attempts += 1

      val (ok, msg) = sendOne(ctx, endpoint, it)
      if (ok) {
        it.status = "SENT"
        it.lastError = ""
        sentNow += 1
      } else {
        it.status = "FAILED"
        it.lastError = msg
        failedNow += 1
      }
    }
    SendQueue.save(ctx, items)
    return Pair(sentNow, failedNow)
  }
}
