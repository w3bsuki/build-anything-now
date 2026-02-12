import { useAuth } from "@clerk/clerk-react";
import { Capacitor, registerPlugin, type PluginListenerHandle } from "@capacitor/core";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useRef } from "react";
import { api } from "../../convex/_generated/api";

type PushPermissionState = "prompt" | "granted" | "denied";

type PushPermissions = {
  receive: PushPermissionState;
};

type PushToken = {
  value: string;
};

interface PushNotificationsPlugin {
  checkPermissions: () => Promise<PushPermissions>;
  requestPermissions: () => Promise<PushPermissions>;
  register: () => Promise<void>;
  addListener(eventName: "registration", listenerFunc: (token: PushToken) => void): Promise<PluginListenerHandle>;
  addListener(eventName: "registrationError", listenerFunc: (error: unknown) => void): Promise<PluginListenerHandle>;
}

const PushNotifications = registerPlugin<PushNotificationsPlugin>("PushNotifications");

function getPushPlatform(): "ios" | "android" | "web" | "unknown" {
  const platform = Capacitor.getPlatform();
  if (platform === "ios") return "ios";
  if (platform === "android") return "android";
  if (platform === "web") return "web";
  return "unknown";
}

export function usePushRegistration() {
  const { isSignedIn } = useAuth();
  const settings = useQuery(api.settings.getSettings);
  const createPushToken = useMutation(api.notifications.createPushToken);
  const deleteAllPushTokens = useMutation(api.notifications.deleteAllPushTokens);
  const activeTokenRef = useRef<string | null>(null);
  const isNativePlatform = useMemo(() => Capacitor.isNativePlatform(), []);

  useEffect(() => {
    if (!isNativePlatform || !isSignedIn || !settings) return;
    if (settings.pushNotifications) return;

    activeTokenRef.current = null;
    void deleteAllPushTokens().catch((error) => {
      console.error("Failed to clear push tokens:", error);
    });
  }, [deleteAllPushTokens, isNativePlatform, isSignedIn, settings]);

  useEffect(() => {
    if (!isNativePlatform || !isSignedIn || !settings?.pushNotifications) return;

    let cancelled = false;
    const listenerHandles: PluginListenerHandle[] = [];

    const register = async () => {
      try {
        const registrationHandle = await PushNotifications.addListener("registration", (token) => {
          if (cancelled) return;
          const value = token.value?.trim();
          if (!value || value === activeTokenRef.current) return;

          activeTokenRef.current = value;
          void createPushToken({
            token: value,
            platform: getPushPlatform(),
          }).catch((error) => {
            console.error("Failed to persist push token:", error);
          });
        });
        listenerHandles.push(registrationHandle);

        const registrationErrorHandle = await PushNotifications.addListener("registrationError", (error) => {
          console.error("Push registration failed:", error);
        });
        listenerHandles.push(registrationErrorHandle);

        let permissions = await PushNotifications.checkPermissions();
        if (permissions.receive === "prompt") {
          permissions = await PushNotifications.requestPermissions();
        }

        if (permissions.receive !== "granted") {
          return;
        }

        await PushNotifications.register();
      } catch (error) {
        console.error("Push registration bootstrap failed:", error);
      }
    };

    void register();

    return () => {
      cancelled = true;
      for (const handle of listenerHandles) {
        void handle.remove();
      }
    };
  }, [createPushToken, isNativePlatform, isSignedIn, settings?.pushNotifications]);
}
