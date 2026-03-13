package com.wifisense.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.SeekBar
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.wifisense.WifiSenseApp
import com.wifisense.databinding.FragmentSettingsBinding
import com.wifisense.wifi.WifiScanner
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

class SettingsFragment : Fragment() {

    private var _binding: FragmentSettingsBinding? = null
    private val binding get() = _binding!!
    private lateinit var scanner: WifiScanner

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSettingsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        scanner = (requireActivity().application as WifiSenseApp).wifiScanner

        binding.tvVersion.text = "WiFi Sense v1.0.0"

        // Scan interval slider (1s - 10s)
        binding.seekInterval.max = 9
        binding.seekInterval.progress = 1 // default 2s
        updateIntervalLabel(2000)

        binding.seekInterval.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(sb: SeekBar?, progress: Int, fromUser: Boolean) {
                updateIntervalLabel((progress + 1) * 1000)
            }
            override fun onStartTrackingTouch(sb: SeekBar?) {}
            override fun onStopTrackingTouch(sb: SeekBar?) {
                val interval = ((sb?.progress ?: 1) + 1) * 1000L
                if (scanner.state.value.isScanning) {
                    scanner.stop()
                    scanner.start(interval)
                }
            }
        })

        binding.btnClearLock.setOnClickListener {
            scanner.lockToBssid(null)
        }

        viewLifecycleOwner.lifecycleScope.launch {
            scanner.state.collectLatest { state ->
                binding.tvLockedRouter.text = "Locked Router: ${state.lockedBssid ?: "none"}"
                binding.tvTotalScans.text = "Total Scans: ${state.scanCount}"
                binding.tvHistorySize.text = "RSSI History: ${state.rssiHistory.size} samples"
            }
        }
    }

    private fun updateIntervalLabel(ms: Int) {
        binding.tvInterval.text = "Scan Interval: ${ms / 1000}s"
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
