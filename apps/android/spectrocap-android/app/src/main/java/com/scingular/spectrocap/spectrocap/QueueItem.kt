package com.scingular.spectrocap.spectrocap

data class QueueItem(
  val id: String,
  val filePath: String,
  var status: String = "QUEUED",   // QUEUED | SENT | FAILED
  var attempts: Int = 0,
  var lastError: String = "",
  val createdAt: Long = System.currentTimeMillis()
)
