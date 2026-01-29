package com.scingular.spectrocap.spectrocap

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.util.UUID

object SendQueue {
  private fun queueFile(ctx: Context): File {
    val dir = File(ctx.filesDir, "queue").apply { mkdirs() }
    return File(dir, "queue.json")
  }

  fun load(ctx: Context): MutableList<QueueItem> {
    val f = queueFile(ctx)
    if (!f.exists()) return mutableListOf()
    val txt = f.readText(Charsets.UTF_8).trim()
    if (txt.isEmpty()) return mutableListOf()

    val arr = JSONArray(txt)
    val out = mutableListOf<QueueItem>()
    for (i in 0 until arr.length()) {
      val o = arr.getJSONObject(i)
      out.add(
        QueueItem(
          id = o.optString("id"),
          filePath = o.optString("filePath"),
          status = o.optString("status", "QUEUED"),
          attempts = o.optInt("attempts", 0),
          lastError = o.optString("lastError", ""),
          createdAt = o.optLong("createdAt", System.currentTimeMillis())
        )
      )
    }
    return out
  }

  fun save(ctx: Context, items: List<QueueItem>) {
    val arr = JSONArray()
    for (it in items) {
      val o = JSONObject()
      o.put("id", it.id)
      o.put("filePath", it.filePath)
      o.put("status", it.status)
      o.put("attempts", it.attempts)
      o.put("lastError", it.lastError)
      o.put("createdAt", it.createdAt)
      arr.put(o)
    }
    val f = queueFile(ctx)
    f.writeText(arr.toString(), Charsets.UTF_8)
  }

  fun enqueueFile(ctx: Context, filePath: String): QueueItem {
    val items = load(ctx)
    val qi = QueueItem(id = "cap_" + UUID.randomUUID().toString().replace("-", ""), filePath = filePath)
    items.add(0, qi)
    save(ctx, items)
    return qi
  }

  fun counts(ctx: Context): Triple<Int, Int, Int> {
    val items = load(ctx)
    val queued = items.count { it.status == "QUEUED" }
    val sent = items.count { it.status == "SENT" }
    val failed = items.count { it.status == "FAILED" }
    return Triple(queued, sent, failed)
  }
}
