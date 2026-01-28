package com.scingular.spectrocap.firebase

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.storage.FirebaseStorage

/**
 * Firebase Client Singleton
 * 
 * Provides access to Firebase Auth, Firestore, and Storage
 * SpectroCAP™ Phase 1 — Android Kotlin Client
 */
object FirebaseClient {
    val auth: FirebaseAuth by lazy { FirebaseAuth.getInstance() }
    val firestore: FirebaseFirestore by lazy { FirebaseFirestore.getInstance() }
    val storage: FirebaseStorage by lazy { FirebaseStorage.getInstance() }
}
