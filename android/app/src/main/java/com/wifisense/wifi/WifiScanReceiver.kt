package com.wifisense.wifi

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.wifi.WifiManager
import android.util.Log

class WifiScanReceiver : BroadcastReceiver() {

    companion object {
        const val TAG = "WifiScanReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == WifiManager.SCAN_RESULTS_AVAILABLE_ACTION) {
            val success = intent.getBooleanExtra(WifiManager.EXTRA_RESULTS_UPDATED, false)
            if (success) {
                Log.d(TAG, "WiFi scan results available")
            } else {
                Log.w(TAG, "WiFi scan failed, using cached results")
            }
        }
    }
}
