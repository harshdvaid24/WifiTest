package com.wifisense.ui

import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.wifisense.R
import com.wifisense.WifiSenseApp
import com.wifisense.databinding.FragmentSignalBinding
import com.wifisense.wifi.AccessPoint
import com.wifisense.wifi.WifiScanner
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

class SignalFragment : Fragment() {

    private var _binding: FragmentSignalBinding? = null
    private val binding get() = _binding!!
    private lateinit var scanner: WifiScanner

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSignalBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        scanner = (requireActivity().application as WifiSenseApp).wifiScanner

        viewLifecycleOwner.lifecycleScope.launch {
            scanner.state.collectLatest { state ->
                binding.tvStatus.text = if (state.isScanning) "Scanning..." else "Stopped"
                binding.tvLocked.text = "Locked: ${state.lockedBssid ?: "none"}"
                binding.apList.removeAllViews()

                state.accessPoints.forEach { ap ->
                    val row = layoutInflater.inflate(R.layout.item_access_point, binding.apList, false)
                    row.findViewById<TextView>(R.id.tvSsid).text = ap.ssid.ifEmpty { "(hidden)" }
                    row.findViewById<TextView>(R.id.tvBssid).text = ap.bssid
                    row.findViewById<TextView>(R.id.tvRssi).apply {
                        text = "${ap.rssi} dBm"
                        setTextColor(rssiColor(ap.rssi))
                    }
                    row.findViewById<TextView>(R.id.tvFreq).text = "${ap.frequency} MHz"

                    val isLocked = state.lockedBssid == ap.bssid
                    if (isLocked) {
                        row.setBackgroundColor(Color.parseColor("#1A4CAF50"))
                    }
                    row.setOnClickListener {
                        scanner.lockToBssid(if (isLocked) null else ap.bssid)
                    }
                    binding.apList.addView(row)
                }
            }
        }
    }

    private fun rssiColor(rssi: Int): Int = when {
        rssi >= -50 -> Color.parseColor("#4CAF50")
        rssi >= -70 -> Color.parseColor("#FF9800")
        else -> Color.parseColor("#F44336")
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
