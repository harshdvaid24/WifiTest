package com.wifisense.wifi

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.net.wifi.WifiManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import kotlinx.coroutines.*

class WifiScannerModule(reactContext: ReactApplicationContext)
    : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "WifiScanner"

    private val wifiManager = reactContext
        .getSystemService(Context.WIFI_SERVICE) as WifiManager
    private var scanJob: Job? = null
    private val scope = CoroutineScope(Dispatchers.IO)

    private val receiver = object : BroadcastReceiver() {
        override fun onReceive(ctx: Context, intent: Intent) {
            if (!wifiManager.isWifiEnabled) return
            val results = wifiManager.scanResults
            val array = Arguments.createArray()
            results.forEach { ap ->
                val map = Arguments.createMap()
                map.putString("bssid", ap.BSSID)
                map.putString("ssid", ap.SSID)
                map.putInt("rssi", ap.level)
                map.putInt("frequency", ap.frequency)
                array.pushMap(map)
            }
            val payload = Arguments.createMap()
            payload.putDouble("timestamp", System.currentTimeMillis().toDouble())
            payload.putArray("results", array)
            emit("WifiScanResult", payload)
        }
    }

    @ReactMethod
    fun startScanning(intervalMs: Int, promise: Promise) {
        val filter = IntentFilter(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION)
        reactApplicationContext.registerReceiver(receiver, filter)
        scanJob = scope.launch {
            while (isActive) {
                wifiManager.startScan()
                delay(intervalMs.toLong())
            }
        }
        promise.resolve("scanning_started")
    }

    @ReactMethod
    fun stopScanning(promise: Promise) {
        scanJob?.cancel()
        try {
            reactApplicationContext.unregisterReceiver(receiver)
        } catch (_: Exception) {}
        promise.resolve("scanning_stopped")
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for NativeEventEmitter
    }

    private fun emit(event: String, data: WritableMap) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(event, data)
    }
}
