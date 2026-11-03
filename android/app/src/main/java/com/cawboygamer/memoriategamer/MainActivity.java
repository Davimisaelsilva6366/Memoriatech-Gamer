package com.cawboygamer.memoriategamer;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(HardwarePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
