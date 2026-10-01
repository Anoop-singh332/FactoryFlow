const mqtt = require("mqtt");

const MQTT_BROKER =
  process.env.MQTT_BROKER || "mqtt://127.0.0.1:1883";

const client = mqtt.connect(MQTT_BROKER, {
  protocolVersion: 5,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  reconnectPeriod: 5000,
});

client.on("connect", () => {
  console.log("✅ MQTT Connected");

  // Subscribe to machine status
  client.subscribe(
    "factory/machines/+/status",
    { qos: 1 },
    (err) => {
      if (err) {
        console.error(
          "❌ MQTT Status Subscribe Error:",
          err.message
        );
        return;
      }

      console.log(
        "📡 Subscribed to factory/machines/+/status"
      );
    }
  );

  // Subscribe to machine state response
  client.subscribe(
    "factory/machines/+/state",
    { qos: 1 },
    (err) => {
      if (err) {
        console.error(
          "❌ MQTT State Subscribe Error:",
          err.message
        );
        return;
      }

      console.log(
        "📡 Subscribed to factory/machines/+/state"
      );
    }
  );
});

client.on("error", (error) => {
  console.error("❌ MQTT Error:", error.message);
});

client.on("reconnect", () => {
  console.log("🔄 MQTT Reconnecting...");
});

client.on("close", () => {
  console.log("⚠️ MQTT Connection Closed");
});

module.exports = client;