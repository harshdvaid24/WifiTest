package com.wifisense.ui

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.wifisense.WifiSenseApp
import com.wifisense.databinding.FragmentDashboardBinding
import com.wifisense.wifi.WifiScanner
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import kotlin.math.abs
import kotlin.math.sqrt

class DashboardFragment : Fragment() {

    private var _binding: FragmentDashboardBinding? = null
    private val binding get() = _binding!!
    private lateinit var scanner: WifiScanner

    private val permLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { results ->
        if (results.values.all { it }) {
            startScanning()
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        scanner = (requireActivity().application as WifiSenseApp).wifiScanner

        binding.btnToggle.setOnClickListener {
            if (scanner.state.value.isScanning) {
                scanner.stop()
            } else {
                requestPermissionsAndStart()
            }
        }

        viewLifecycleOwner.lifecycleScope.launch {
            scanner.state.collectLatest { state ->
                binding.btnToggle.text = if (state.isScanning) "Stop Scanning" else "Start Scanning"
                binding.tvScanCount.text = "Scans: ${state.scanCount}"
                binding.tvApCount.text = "Access Points: ${state.accessPoints.size}"

                if (state.accessPoints.isNotEmpty()) {
                    val strongest = state.accessPoints.first()
                    binding.tvStrongest.text = "Strongest: ${strongest.ssid.ifEmpty { "(hidden)" }} (${strongest.rssi} dBm)"
                } else {
                    binding.tvStrongest.text = "Strongest: --"
                }

                // Presence estimate based on RSSI variance
                if (state.rssiHistory.size >= 5) {
                    val mean = state.rssiHistory.average()
                    val variance = state.rssiHistory.map { (it - mean) * (it - mean) }.average()
                    val std = sqrt(variance)
                    val presence = when {
                        std > 3.0 -> "Motion Detected"
                        std > 1.5 -> "Presence Likely"
                        else -> "Room Empty"
                    }
                    binding.tvPresence.text = presence
                    binding.tvRssiStats.text = String.format(
                        "RSSI  mean=%.1f  std=%.2f", mean, std
                    )
                } else if (state.lockedBssid != null) {
                    binding.tvPresence.text = "Calibrating..."
                    binding.tvRssiStats.text = "Collecting samples (${state.rssiHistory.size}/5)"
                } else {
                    binding.tvPresence.text = "No router locked"
                    binding.tvRssiStats.text = "Lock a router in Signal tab"
                }
            }
        }
    }

    private fun requestPermissionsAndStart() {
        val needed = arrayOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_WIFI_STATE,
            Manifest.permission.CHANGE_WIFI_STATE
        ).filter {
            ContextCompat.checkSelfPermission(requireContext(), it) != PackageManager.PERMISSION_GRANTED
        }
        if (needed.isEmpty()) {
            startScanning()
        } else {
            permLauncher.launch(needed.toTypedArray())
        }
    }

    private fun startScanning() {
        scanner.start()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
