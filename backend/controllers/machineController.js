const mqttClient = require("../config/mqtt");

// =====================================================
// STORE LATEST STATUS OF MACHINES
// =====================================================

const machineStatuses = {};


// =====================================================
// RECEIVE MQTT MACHINE STATUS
// =====================================================

mqttClient.on("message", (topic, message) => {
  try {
    console.log("\n📥 MQTT MESSAGE RECEIVED");
    console.log("Topic:", topic);

    // Example:
    // factory/machines/M001/status

    const topicParts = topic.split("/");

    if (topicParts.length !== 4) {
      console.log("⚠️ Unknown MQTT topic:", topic);
      return;
    }

    const machineId = topicParts[2];
    const messageType = topicParts[3];

    // We only want status messages
    if (messageType !== "status") {
      return;
    }

    let data;

    try {
      data = JSON.parse(message.toString());
    } catch (error) {
      console.error(
        "❌ MQTT message is not valid JSON"
      );

      console.log(
        "Message:",
        message.toString()
      );

      return;
    }

    console.log("Machine ID:", machineId);
    console.log("Machine Data:", data);

    // Save latest machine status
    machineStatuses[machineId] = {
      data,
      receivedAt: new Date().toISOString(),
      messageCount:
        (machineStatuses[machineId]?.messageCount || 0) + 1,
    };

    console.log(
      "✅ Machine status stored successfully"
    );

  } catch (error) {
    console.error(
      "❌ MQTT status processing error:",
      error.message
    );
  }
});


// =====================================================
// CONTROL MACHINE
// START / STOP
// =====================================================

const controlMachine = async (req, res) => {
  try {
    const { machineId, command } = req.body;

    console.log("\n🎛️ MACHINE CONTROL REQUEST");
    console.log("Machine ID:", machineId);
    console.log("Command:", command);

    // -----------------------------------------------
    // Validate Machine ID
    // -----------------------------------------------

    if (!machineId) {
      return res.status(400).json({
        success: false,
        message: "Machine ID is required.",
      });
    }

    // -----------------------------------------------
    // Validate Command
    // -----------------------------------------------

    if (!command) {
      return res.status(400).json({
        success: false,
        message: "Command is required.",
      });
    }

    // -----------------------------------------------
    // Only allow START / STOP
    // -----------------------------------------------

    const allowedCommands = [
      "START",
      "STOP",
    ];

    if (!allowedCommands.includes(command)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid command. Only START or STOP are allowed.",
      });
    }

    // -----------------------------------------------
    // Check MQTT connection
    // -----------------------------------------------

    if (!mqttClient.connected) {
      return res.status(503).json({
        success: false,
        message:
          "MQTT broker is not connected.",
      });
    }

    // -----------------------------------------------
    // MQTT CONTROL TOPIC
    // -----------------------------------------------

    const topic =
      `factory/machines/${machineId}/control`;

    // -----------------------------------------------
    // MQTT PAYLOAD
    // -----------------------------------------------

    const payload = JSON.stringify({
      machineId,
      command,
      timestamp: new Date().toISOString(),
    });

    console.log("\n📤 MQTT COMMAND");
    console.log("Topic:", topic);
    console.log("Payload:", payload);

    // -----------------------------------------------
    // Publish command
    // -----------------------------------------------

    mqttClient.publish(
      topic,
      payload,
      {
        qos: 1,
        retain: false,
      },
      (error) => {
        if (error) {
          console.error(
            "❌ MQTT Publish Error:",
            error.message
          );

          return res.status(500).json({
            success: false,
            message:
              "Failed to send command to machine.",
            error: error.message,
          });
        }

        console.log(
          `✅ ${command} command sent to ${machineId}`
        );

        return res.status(200).json({
          success: true,
          message:
            `${command} command sent successfully.`,
          data: {
            machineId,
            command,
            topic,
          },
        });
      }
    );

  } catch (error) {
    console.error(
      "❌ Machine control error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to control machine.",
      error: error.message,
    });
  }
};


// =====================================================
// GET MACHINE STATUS
// =====================================================

const getMachineStatus = async (req, res) => {
  try {
    const { machineId } = req.params;

    console.log(
      "\n🔍 Getting machine status:",
      machineId
    );

    if (!machineId) {
      return res.status(400).json({
        success: false,
        message:
          "Machine ID is required.",
      });
    }

    const status =
      machineStatuses[machineId];

    // -----------------------------------------------
    // No status received yet
    // -----------------------------------------------

    if (!status) {
      return res.status(200).json({
        success: true,
        data: {
          machineId,
          data: null,
          receivedAt: null,
          messageCount: 0,
        },
      });
    }

    // -----------------------------------------------
    // Return latest status
    // -----------------------------------------------

    return res.status(200).json({
      success: true,
      data: {
        machineId,
        data: status.data,
        receivedAt: status.receivedAt,
        messageCount: status.messageCount,
      },
    });

  } catch (error) {
    console.error(
      "❌ Get machine status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get machine status.",
      error: error.message,
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  controlMachine,
  getMachineStatus,
};