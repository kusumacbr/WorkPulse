"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BiometricDeviceRecord } from "@/server/services/biometric-service";
import {
  Cpu,
  Plus,
  Radio,
  CheckCircle2,
  RefreshCw,
  Clock,
  X,
} from "lucide-react";

interface BiometricDeviceManagerProps {
  initialDevices?: BiometricDeviceRecord[];
}

export function BiometricDeviceManager({ initialDevices }: BiometricDeviceManagerProps) {
  const [devices, setDevices] = useState<BiometricDeviceRecord[]>(
    initialDevices || [
      {
        id: "dev-hq-floor3",
        organizationId: "org-xorstack",
        name: "HQ 3rd Floor Main Entrance",
        locationName: "HQ Bangalore",
        provider: "GENERIC_WEBHOOK",
        serialNumber: "SN-ZK-883921",
        model: "ZK-Teco SenseFace 4A",
        timezone: "Asia/Kolkata",
        apiKeyHash: "hash_hidden",
        apiSecretHash: "secret_hidden",
        status: "ACTIVE",
        lastHeartbeatAt: new Date().toISOString(),
        lastPunchAt: new Date().toISOString(),
        syncFailureCount: 0,
        firmwareVersion: "v4.1.8-sec",
        ipAddress: "192.168.1.140",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "dev-hq-server",
        organizationId: "org-xorstack",
        name: "HQ Server Room Entrance",
        locationName: "HQ Bangalore",
        provider: "LOCAL_CONNECTOR",
        serialNumber: "SN-MX-992182",
        model: "Matrix COSEC DOOR V2",
        timezone: "Asia/Kolkata",
        apiKeyHash: "hash_hidden",
        apiSecretHash: "secret_hidden",
        status: "ACTIVE",
        lastHeartbeatAt: new Date(Date.now() - 60000).toISOString(),
        lastPunchAt: new Date(Date.now() - 3600000).toISOString(),
        syncFailureCount: 0,
        firmwareVersion: "v2.0.4",
        ipAddress: "192.168.1.145",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
  );

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newDeviceSerial, setNewDeviceSerial] = useState("");
  const [newDeviceLocation, setNewDeviceLocation] = useState("HQ Bangalore");
  const [generatedCredentials, setGeneratedCredentials] = useState<{ apiKey: string; apiSecret: string } | null>(null);

  const handleRegister = () => {
    if (!newDeviceName || !newDeviceSerial) return;

    const fakeApiKey = `wp_live_${Math.random().toString(36).substring(2, 15)}`;
    const fakeApiSecret = `wp_sec_${Math.random().toString(36).substring(2, 25)}`;

    const newDev: BiometricDeviceRecord = {
      id: `dev-${Date.now()}`,
      organizationId: "org-xorstack",
      name: newDeviceName,
      locationName: newDeviceLocation,
      provider: "GENERIC_WEBHOOK",
      serialNumber: newDeviceSerial,
      model: "Standard Biometric Terminal",
      timezone: "Asia/Kolkata",
      apiKeyHash: "hash_stored",
      apiSecretHash: "hash_stored",
      status: "ACTIVE",
      lastHeartbeatAt: new Date().toISOString(),
      lastPunchAt: null,
      syncFailureCount: 0,
      firmwareVersion: "v1.0.0",
      ipAddress: "192.168.1.150",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDevices((prev) => [newDev, ...prev]);
    setGeneratedCredentials({ apiKey: fakeApiKey, apiSecret: fakeApiSecret });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Cpu className="h-4 w-4 text-[var(--brand-primary)]" />
            Registered Biometric Hardware Terminals
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Administer attendance devices, monitor heartbeats, and manage connector credentials.
          </p>
        </div>

        <Button
          variant="brand"
          size="sm"
          className="w-full sm:w-auto text-xs font-semibold gap-1.5 h-8 shrink-0 justify-center"
          onClick={() => {
            setGeneratedCredentials(null);
            setShowRegisterModal(true);
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Register Device
        </Button>
      </div>

      {/* Device Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((device) => (
          <Card key={device.id} className="border-border hover:border-[var(--brand-primary)]/40 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                    {device.name}
                  </CardTitle>
                  <CardDescription className="text-[11px]">
                    {device.model} · SN: {device.serialNumber}
                  </CardDescription>
                </div>
                <Badge variant={device.status === "ACTIVE" ? "brand" : "secondary"} className="text-[10px]">
                  {device.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-muted/40 border border-border text-[11px]">
                <div>
                  <span className="text-muted-foreground block">Location</span>
                  <span className="font-semibold text-foreground">{device.locationName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Integration Mode</span>
                  <span className="font-semibold text-foreground">{device.provider}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Last Heartbeat</span>
                  <span className="font-semibold text-foreground">
                    {device.lastHeartbeatAt ? new Date(device.lastHeartbeatAt).toLocaleTimeString() : "Never"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">IP & Firmware</span>
                  <span className="font-semibold text-foreground">
                    {device.ipAddress} ({device.firmwareVersion})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Sync failures: {device.syncFailureCount}
                </span>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                    <RefreshCw className="h-3 w-3" />
                    Resync Range
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Register Device Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <Card className="w-full max-w-md border-border shadow-2xl bg-card max-h-[92vh] overflow-y-auto custom-scrollbar">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Cpu className="h-4 w-4 text-[var(--brand-primary)]" />
                Register Biometric Terminal
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowRegisterModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-4 text-xs">
              {!generatedCredentials ? (
                <div className="space-y-3">
                  <div>
                    <label className="font-semibold block mb-1">Device Name *</label>
                    <Input
                      placeholder="e.g. HQ 4th Floor Main Entrance"
                      value={newDeviceName}
                      onChange={(e) => setNewDeviceName(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Hardware Serial Number *</label>
                    <Input
                      placeholder="e.g. SN-ZK-991203"
                      value={newDeviceSerial}
                      onChange={(e) => setNewDeviceSerial(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Office Location</label>
                    <Input
                      value={newDeviceLocation}
                      onChange={(e) => setNewDeviceLocation(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-border">
                    <Button variant="ghost" size="sm" onClick={() => setShowRegisterModal(false)} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button variant="brand" size="sm" onClick={handleRegister} className="w-full sm:w-auto">
                      Generate Credentials & Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Device registered! Save credentials now — secret will never be shown again.</span>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">API Key</label>
                    <div className="flex items-center gap-2">
                      <Input readOnly value={generatedCredentials.apiKey} className="h-8 font-mono text-[11px]" />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">API Secret (HMAC Signing Key)</label>
                    <div className="flex items-center gap-2">
                      <Input readOnly value={generatedCredentials.apiSecret} className="h-8 font-mono text-[11px]" />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button variant="brand" size="sm" onClick={() => setShowRegisterModal(false)} className="w-full sm:w-auto">
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
