package com.wifisense

import android.app.Application
import com.wifisense.wifi.WifiScanner

class WifiSenseApp : Application() {

    lateinit var wifiScanner: WifiScanner
        private set

    override fun onCreate() {
        super.onCreate()
        wifiScanner = WifiScanner(this)
    }

    override fun onTerminate() {
        wifiScanner.destroy()
        super.onTerminate()
    }
}
