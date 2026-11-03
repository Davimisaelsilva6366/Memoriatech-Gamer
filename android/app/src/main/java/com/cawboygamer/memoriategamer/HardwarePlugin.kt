package com.cawboygamer.memoriategamer

import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.hardware.SensorManager
import android.os.BatteryManager
import android.os.Build
import android.os.Environment
import android.os.StatFs
import android.util.DisplayMetrics
import android.view.WindowManager
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "Hardware")
class HardwarePlugin : Plugin() {

    @PluginMethod
    fun getInfo(call: PluginCall) {
        try {
            val appContext = context
            val result = JSObject()

            // RAM real do sistema
            val activityManager =
                appContext.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager

            val memory = ActivityManager.MemoryInfo()
            activityManager.getMemoryInfo(memory)

            val totalRam = memory.totalMem
            val availableRam = memory.availMem
            val usedRam = (totalRam - availableRam).coerceAtLeast(0)

            result.put("totalRamMb", totalRam / 1024.0 / 1024.0)
            result.put("availableRamMb", availableRam / 1024.0 / 1024.0)
            result.put("usedRamMb", usedRam / 1024.0 / 1024.0)
            result.put(
                "ramUsagePct",
                if (totalRam > 0) usedRam * 100.0 / totalRam else 0.0
            )

            // Processador
            result.put("coreCount", Runtime.getRuntime().availableProcessors())
            result.put("cpuArchitecture", Build.SUPPORTED_ABIS.joinToString(", "))

            // Identificação do aparelho
            result.put("manufacturer", Build.MANUFACTURER ?: "Desconhecido")
            result.put("model", Build.MODEL ?: "Desconhecido")
            result.put("marketingName", Build.DEVICE ?: "Desconhecido")
            result.put("androidVersion", Build.VERSION.RELEASE ?: "Desconhecida")
            result.put("apiLevel", Build.VERSION.SDK_INT)
            result.put("buildNumber", Build.DISPLAY ?: "Não disponível")
            result.put("securityPatch", Build.VERSION.SECURITY_PATCH ?: "Não disponível")

            // Bateria
            val batteryIntent: Intent? = appContext.registerReceiver(
                null,
                IntentFilter(Intent.ACTION_BATTERY_CHANGED)
            )

            if (batteryIntent != null) {
                val level = batteryIntent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
                val scale = batteryIntent.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
                val status = batteryIntent.getIntExtra(BatteryManager.EXTRA_STATUS, -1)
                val health = batteryIntent.getIntExtra(BatteryManager.EXTRA_HEALTH, -1)
                val temperature =
                    batteryIntent.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, -1)
                val voltage =
                    batteryIntent.getIntExtra(BatteryManager.EXTRA_VOLTAGE, -1)

                val percentage =
                    if (level >= 0 && scale > 0) level * 100.0 / scale else 0.0

                result.put("batteryLevelPct", percentage)
                result.put(
                    "isCharging",
                    status == BatteryManager.BATTERY_STATUS_CHARGING ||
                        status == BatteryManager.BATTERY_STATUS_FULL
                )

                result.put(
                    "batteryHealth",
                    when (health) {
                        BatteryManager.BATTERY_HEALTH_GOOD -> "Boa"
                        BatteryManager.BATTERY_HEALTH_OVERHEAT -> "Superaquecida"
                        BatteryManager.BATTERY_HEALTH_DEAD -> "Desgastada"
                        BatteryManager.BATTERY_HEALTH_OVER_VOLTAGE -> "Sobretensão"
                        BatteryManager.BATTERY_HEALTH_COLD -> "Fria"
                        else -> "Não identificada"
                    }
                )

                result.put(
                    "batteryTempC",
                    if (temperature >= 0) temperature / 10.0 else null
                )
                result.put("batteryVoltageMv", voltage.coerceAtLeast(0))
            }

            // Armazenamento
            val stat = StatFs(Environment.getDataDirectory().absolutePath)

            result.put("storageTotalBytes", stat.totalBytes)
            result.put("storageAvailableBytes", stat.availableBytes)

            // Tela
            val windowManager =
                appContext.getSystemService(Context.WINDOW_SERVICE) as WindowManager

            val display = windowManager.defaultDisplay
            val metrics = DisplayMetrics()
            display.getRealMetrics(metrics)

            result.put(
                "screenResolution",
                "${metrics.widthPixels} × ${metrics.heightPixels}"
            )
            result.put("screenDpi", metrics.densityDpi)
            result.put("refreshRateHz", display.refreshRate.toDouble())

            // Sensores disponíveis
            val sensorManager =
                appContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager

            val sensorNames = sensorManager.getSensorList(SensorManager.TYPE_ALL)
                .map { sensor -> "${sensor.name} (${sensor.vendor})" }

            result.put("sensors", JSArray(sensorNames))

            // Medições ainda não implementadas
            result.put("cpuFrequencyGhz", null)
            result.put("cpuUsagePct", null)
            result.put("cpuTempC", null)
            result.put("socTempC", null)

            call.resolve(result)

        } catch (exception: Exception) {
            call.reject(
                "Não foi possível consultar os dados do Android: ${exception.message}",
                exception
            )
        }
    }
}
