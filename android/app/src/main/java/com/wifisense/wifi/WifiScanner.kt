package com.wifisense.wifi

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.wifi.ScanResult
import android.net.wifi.WifiManager
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

data class AccessPoint(
    val bssid: String,
    val ssid: String,
    val rssi: Int,
    val frequency: Int,
    val timestamp: Long = System.currentTimeMillis()
)

data class ScanState(
    val accessPoints: List<AccessPoint> = emptyList(),
    val scanCount: Int = 0,
    val isScanning: Boolean = false,
    val lockedBssid: String? = null,
    val rssiHistory: List<Int> = emptyList()
)

class WifiScanner(private val context: Context) {

    private val wifiManager = context.getSystemService(Context.WIFI_SERVICE) as WifiManager
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var scanJob: Job? = null

    private val _state = MutableStateFlow(ScanState())
    val state: StateFlow<ScanState> = _state

    private val receiver = object : BroadcastReceiver() {
        override fun onReceive(ctx: Context, intent: Intent) {
            if (intent.action != WifiManager.SCAN_RESULTS_AVAILABLE_ACTION) return
            processScanResults(wifiManager.scanResults)
        }
    }

    fun start(intervalMs: Long = 2000L) {
        if (_state.value.isScanning) return
        context.registerReceiver(
            receiver, IntentFilter(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION)
        )
        _state.value = _state.value.copy(isScanning = true)
        scanJob = scope.launch {
            while (isActive) {
                @Suppress("DEPRECATION")
                wifiManager.startScan()
                delay(intervalMs)
            }
        }
    }

    fun stop() {
        scanJob?.cancel()
        scanJob = null
        try { context.unregisterReceiver(receiver) } catch (_: Exception) {}
        _state.value = _state.value.copy(isScanning = false)
    }

    fun lockToBssid(bssid: String?) {
        _state.value = _state.value.copy(lockedBssid = bssid, rssiHistory = emptyList())
    }

    private fun processScanResults(results: List<ScanResult>) {
        val aps = results.map { ap ->
            AccessPoint(
                bssid = ap.BSSID,
                ssid = ap.SSID,
                rssi = ap.level,
                frequency = ap.frequency
            )
        }.sortedByDescending { it.rssi }

        val current = _state.value
        val history = if (current.lockedBssid != null) {
            val locked = aps.find { it.bssid == current.lockedBssid }
            val newHistory = current.rssiHistory.toMutableList()
            if (locked != null) newHistory.add(locked.rssi)
            if (newHistory.size > 100) newHistory.removeAt(0)
            newHistory
        } else {
            current.rssiHistory
        }

        _state.value = current.copy(
            accessPoints = aps,
            scanCount = current.scanCount + 1,
            rssiHistory = history
        )
    }

    fun destroy() {
        stop()
        scope.cancel()
    }
}
