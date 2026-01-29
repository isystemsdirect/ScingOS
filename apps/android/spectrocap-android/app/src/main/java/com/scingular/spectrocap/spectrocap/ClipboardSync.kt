package com.scingular.spectrocap.spectrocap

import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

object ClipboardSync {

  fun push(endpointBase: String, text: String, from: String = "android"): Pair<Boolean, String> {
    try {
      val base = endpointBase.trim().trimEnd('/')
      val url = URL("$base/clip/push")
      val con = (url.openConnection() as HttpURLConnection).apply {
        requestMethod = "POST"
        connectTimeout = 8000
        readTimeout = 15000
        doOutput = true
        setRequestProperty("Content-Type", "application/json")
      }
      val body = JSONObject()
      body.put("text", text)
      body.put("from", from)

      OutputStreamWriter(con.outputStream, Charsets.UTF_8).use { it.write(body.toString()) }
      val code = con.responseCode
      val ok = (code in 200..299)
      con.disconnect()
      return Pair(ok, "HTTP $code")
    } catch (t: Throwable) {
      return Pair(false, t.message ?: t.toString())
    }
  }
}
