package com.palletscanapp

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "PalletScanApp"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  // Requerido por react-native-screens: le decimos a Android que no intente
  // restaurar el estado de la vista por su cuenta: React Navigation se
  // encarga de reconstruir la pantalla correcta. Sin esto, la app puede
  // crashear al reabrirse después de que Android la mató en segundo plano.
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }
}