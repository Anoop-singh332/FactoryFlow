const mqttClient = require("../config/mqtt");

const Machine = require("../models/Machine");
const MachineStatusHistory = require("../models/MachineStatusHistory");
const MachineProductionHistory = require("../models/MachineProductionHistory");

const machineStatuses = {};

const STATUS_COLORS = {
  STOPPED: "RED",
  IDLE: "YELLOW",
  RUNNING: "GREEN",
};

const ALLOWED_STATUSES = ["STOPPED", "IDLE", "RUNNING"];
const ALLOWED_COMMANDS = ["START", "STOP"];
const ALLOWED_COLORS = ["RED", "YELLOW", "GREEN"];

/* =========================================================
   FIND MACHINE
========================================================= */

const findMachineByAnyId = async (machineId) => {
  if (
    machineId === undefined ||
    machineId === null ||
    String(machineId).trim() === ""
  ) {
    return null;
  }

  const cleanId = String(machineId).trim();

  let machine = await Machine.findOne({
    mqttMachineId: cleanId,
  });

  if (machine) {
    return machine;
  }

  const escapedId = cleanId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  machine = await Machine.findOne({
    mqttMachineId: {
      $regex: `^${escapedId}$`,
      $options: "i",
    },
  });

  if (machine) {
    return machine;
  }

  try {
    machine = await Machine.findById(cleanId);

    if (machine) {
      return machine;
    }
  } catch (error) {}

  return null;
};

const getMachineMqttId = (machine) =>
  machine?.mqttMachineId || String(machine?._id || "");

/* =========================================================
   INDIA DATE HELPERS
========================================================= */

const getIndiaDate = (date = new Date()) => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
};

const getIndiaDayStart = (date = new Date()) => {
  const indiaDate = getIndiaDate(date);

  return new Date(`${indiaDate}T00:00:00+05:30`);
};

/* =========================================================
   STATUS HISTORY
========================================================= */

const createCurrentHistory = async ({
  machineId,
  status,
  startTime,
  endTime = null,
}) => {
  const color = STATUS_COLORS[status];

  if (!color) {
    return null;
  }

  const start = new Date(startTime);
  const finalEnd = endTime ? new Date(endTime) : null;

  if (!finalEnd) {
    const currentDate = getIndiaDate(start);

    const existing = await MachineStatusHistory.findOne({
      machineId,
      date: currentDate,
      status,
      startTime: start,
      endTime: null,
    });

    if (existing) {
      return existing;
    }

    return MachineStatusHistory.create({
      machineId,
      date: currentDate,
      status,
      color,
      startTime: start,
      endTime: null,
      durationSeconds: 0,
    });
  }

  let currentStart = start;

  while (currentStart < finalEnd) {
    const currentDate = getIndiaDate(currentStart);

    const nextDayStart = getIndiaDayStart(currentStart);
    nextDayStart.setDate(nextDayStart.getDate() + 1);

    const segmentEnd = finalEnd < nextDayStart ? finalEnd : nextDayStart;

    if (segmentEnd <= currentStart) {
      break;
    }

    const durationSeconds = Math.max(
      0,
      Math.floor((segmentEnd.getTime() - currentStart.getTime()) / 1000),
    );

    let history = await MachineStatusHistory.findOne({
      machineId,
      date: currentDate,
      status,
      startTime: currentStart,
    });

    if (!history) {
      history = await MachineStatusHistory.create({
        machineId,
        date: currentDate,
        status,
        color,
        startTime: currentStart,
        endTime: segmentEnd,
        durationSeconds,
      });
    } else {
      history.endTime = segmentEnd;
      history.durationSeconds = durationSeconds;

      await history.save();
    }

    if (segmentEnd >= finalEnd) {
      break;
    }

    currentStart = segmentEnd;
  }
};

const closeCurrentHistory = async (machineId, status, endTime) => {
  if (!ALLOWED_STATUSES.includes(status)) {
    return;
  }

  const openHistory = await MachineStatusHistory.findOne({
    machineId,
    status,
    endTime: null,
  }).sort({
    startTime: -1,
  });

  if (!openHistory) {
    return;
  }

  const start = new Date(openHistory.startTime);
  const end = new Date(endTime);

  if (getIndiaDate(start) === getIndiaDate(end)) {
    openHistory.endTime = end;

    openHistory.durationSeconds = Math.max(0, Math.floor((end - start) / 1000));

    await openHistory.save();

    return;
  }

  const firstDayEnd = getIndiaDayStart(end);

  openHistory.endTime = firstDayEnd;

  openHistory.durationSeconds = Math.max(
    0,
    Math.floor((firstDayEnd - start) / 1000),
  );

  await openHistory.save();

  await MachineStatusHistory.create({
    machineId,
    date: getIndiaDate(firstDayEnd),
    status,
    color: STATUS_COLORS[status],
    startTime: firstDayEnd,
    endTime: end,
    durationSeconds: Math.max(0, Math.floor((end - firstDayEnd) / 1000)),
  });
};

const handleMachineStatusHistory = async ({
  machineId,
  machineStatus,
  previousStatus,
  statusStartedAt,
}) => {
  const now = new Date();

  if (!previousStatus) {
    await createCurrentHistory({
      machineId,
      status: machineStatus,
      startTime: statusStartedAt || now,
      endTime: null,
    });

    return;
  }

  if (previousStatus === machineStatus) {
    return;
  }

  await closeCurrentHistory(machineId, previousStatus, now);

  await createCurrentHistory({
    machineId,
    status: machineStatus,
    startTime: now,
    endTime: null,
  });
};

/* =========================================================
   MQTT COMMAND
========================================================= */

const publishMachineCommand = (machineId, command) => {
  return new Promise((resolve, reject) => {
    if (!mqttClient.connected) {
      return reject(new Error("MQTT broker is not connected."));
    }

    const topic = `factory/machines/${machineId}/control`;

    const payload = JSON.stringify({
      machineId,
      command,
      timestamp: new Date().toISOString(),
    });

    console.log("\n📤 MQTT COMMAND");
    console.log("Topic:", topic);
    console.log("Payload:", payload);

    mqttClient.publish(
      topic,
      payload,
      {
        qos: 1,
        retain: false,
      },
      (error) => {
        if (error) {
          console.error("❌ MQTT Publish Error:", error.message);

          return reject(error);
        }

        console.log(`✅ ${command} command sent to ${machineId}`);

        resolve({
          topic,
          payload,
        });
      },
    );
  });
};

/* =========================================================
   MQTT MESSAGE RECEIVER
========================================================= */

mqttClient.on("message", async (topic, message) => {
  try {
    console.log("\n📥 MQTT MESSAGE RECEIVED");
    console.log("Topic:", topic);

    const topicParts = topic.split("/");

    if (topicParts.length !== 4) {
      return;
    }

    const machineId = topicParts[2];
    const messageType = topicParts[3];

    let data;

    try {
      data = JSON.parse(message.toString());
    } catch (error) {
      console.error("❌ MQTT message is not valid JSON");

      return;
    }

    console.log("Machine ID:", machineId);
    console.log("Machine Data:", data);

    /* =====================================================
       MACHINE STATE
    ===================================================== */

    if (messageType === "state") {
      const { machineColor } = data;

      if (!ALLOWED_COLORS.includes(machineColor)) {
        console.error("❌ Invalid machineColor. Use RED, YELLOW or GREEN.");

        return;
      }

      const existingMachine = await findMachineByAnyId(machineId);

      if (!existingMachine) {
        console.error(`❌ Machine ${machineId} not found in database.`);

        return;
      }

      const databaseMachineId = String(existingMachine._id);

      const mqttMachineId = getMachineMqttId(existingMachine);

      const now = new Date();

      let machineStatus;
      let machinePermission;

      if (machineColor === "GREEN") {
        machineStatus = "RUNNING";
        machinePermission = true;
      }

      if (machineColor === "YELLOW") {
        machineStatus = "IDLE";
        machinePermission = true;
      }

      if (machineColor === "RED") {
        machineStatus = "STOPPED";
        machinePermission = false;
      }

      const previousStatus = existingMachine.machineStatus || "STOPPED";

      let statusStartedAt = existingMachine.statusStartedAt || now;

      if (previousStatus !== machineStatus) {
        statusStartedAt = now;
      }

      await handleMachineStatusHistory({
        machineId: databaseMachineId,
        machineStatus,
        previousStatus,
        statusStartedAt,
      });

      const machine = await Machine.findOneAndUpdate(
        {
          _id: existingMachine._id,
        },
        {
          $set: {
            machineColor,
            machineStatus,
            machinePermission,
            machineOnline: true,
            lastSeenAt: now,
            statusStartedAt,
          },
        },
        {
          new: true,
          upsert: false,
        },
      );

      if (!machine) {
        console.error(`❌ Machine ${machineId} could not be updated.`);

        return;
      }

      machineStatuses[mqttMachineId] = {
        data: {
          machineId: mqttMachineId,
          machineColor: machine.machineColor,
          machineStatus: machine.machineStatus,
          machinePermission: machine.machinePermission,
          productionCount: machine.productionCount || 0,
          machineOnline: machine.machineOnline === true,
          lastSeenAt: machine.lastSeenAt,
          statusStartedAt: machine.statusStartedAt,
        },

        receivedAt: now.toISOString(),

        messageCount: (machineStatuses[mqttMachineId]?.messageCount || 0) + 1,
      };

      console.log("\n========================================");

      console.log("✅ COMPLETE MACHINE RESPONSE SAVED");

      console.log("========================================");

      console.log("Machine ID:", mqttMachineId);

      console.log("Machine Color:", machine.machineColor);

      console.log("Machine Status:", machine.machineStatus);

      console.log("Machine Permission:", machine.machinePermission);

      console.log("Production Count:", machine.productionCount || 0);

      console.log("Machine Online:", machine.machineOnline);

      console.log("Last Seen:", machine.lastSeenAt);

      console.log("Status Started At:", machine.statusStartedAt);

      if (machinePermission === false) {
        console.error(`🔴 Machine ${mqttMachineId} is OFF.`);

        console.error(
          "⚠️ Machine is OFF. Please give access to operate the machine.",
        );

        return;
      }

      console.log(`🟢 Machine ${mqttMachineId} is allowed to operate.`);

      console.log(`Current status: ${machineStatus}`);

      return;
    }

    /* =====================================================
       LEGACY STATUS
    ===================================================== */

    if (messageType === "status") {
      machineStatuses[machineId] = {
        data,

        receivedAt: new Date().toISOString(),

        messageCount: (machineStatuses[machineId]?.messageCount || 0) + 1,
      };

      return;
    }
  } catch (error) {
    console.error("❌ MQTT message processing error:", error.message);
  }
});

/* =========================================================
   CONTROL MACHINE
========================================================= */

const controlMachine = async (req, res) => {
  try {
    const { machineId, command } = req.body;

    if (!machineId) {
      return res.status(400).json({
        success: false,
        message: "Machine ID is required.",
      });
    }

    if (!command) {
      return res.status(400).json({
        success: false,
        message: "Command is required.",
      });
    }

    if (!ALLOWED_COMMANDS.includes(command)) {
      return res.status(400).json({
        success: false,
        message: "Invalid command. Only START or STOP are allowed.",
      });
    }

    const machine = await findMachineByAnyId(machineId);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: "Machine not found.",
      });
    }

    if (command === "START" && machine.machinePermission === false) {
      return res.status(403).json({
        success: false,
        message:
          "Machine permission is OFF. Turn permission ON before starting the machine.",
      });
    }

    const mqttMachineId = getMachineMqttId(machine);

    const result = await publishMachineCommand(mqttMachineId, command);

    return res.status(200).json({
      success: true,
      message: `${command} command sent successfully.`,

      data: {
        machineId: machine._id,
        mqttMachineId,
        command,
        topic: result.topic,
      },
    });
  } catch (error) {
    console.error("❌ Machine control error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to control machine.",
      error: error.message,
    });
  }
};

/* =========================================================
   MACHINE PERMISSION
========================================================= */

const setMachinePermission = async (req, res) => {
  try {
    const { machineId, permission } = req.body;

    if (!machineId) {
      return res.status(400).json({
        success: false,
        message: "Machine ID is required.",
      });
    }

    if (typeof permission !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Permission must be true or false.",
      });
    }

    const machine = await findMachineByAnyId(machineId);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: "Machine not found.",
      });
    }

    const previousStatus = machine.machineStatus || "STOPPED";

    const machineColor = permission ? "YELLOW" : "RED";

    const machineStatus = permission ? "IDLE" : "STOPPED";

    const now = new Date();

    const statusChanged = previousStatus !== machineStatus;

    machine.machinePermission = permission;

    machine.machineStatus = machineStatus;

    machine.machineColor = machineColor;

    machine.statusStartedAt = statusChanged
      ? now
      : machine.statusStartedAt || now;

    if (permission) {
      machine.machineOnline = true;
      machine.lastSeenAt = now;
    } else {
      machine.machineOnline = false;
      machine.lastSeenAt = null;
    }

    await machine.save();

    if (statusChanged) {
      await handleMachineStatusHistory({
        machineId: String(machine._id),
        machineStatus,
        previousStatus,
        statusStartedAt: machine.statusStartedAt,
      });
    }

    const mqttMachineId = getMachineMqttId(machine);

    const statePayload = {
      machineId: mqttMachineId,
      machineColor,
    };

    if (!mqttClient.connected) {
      return res.status(503).json({
        success: false,
        message: "Permission saved, but MQTT broker is not connected.",

        data: {
          machineId: mqttMachineId,
          machinePermission: machine.machinePermission,
          machineStatus: machine.machineStatus,
          machineColor: machine.machineColor,
        },
      });
    }

    await new Promise((resolve, reject) => {
      mqttClient.publish(
        `factory/machines/${mqttMachineId}/state`,
        JSON.stringify(statePayload),
        {
          qos: 1,
          retain: true,
        },
        (error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        },
      );
    });

    const response = {
      machineId: mqttMachineId,
      machineName: machine.machineName,
      machinePermission: machine.machinePermission,
      machineStatus: machine.machineStatus,
      machineColor: machine.machineColor,
      machineOnline: machine.machineOnline,
      lastSeenAt: machine.lastSeenAt,
      statusStartedAt: machine.statusStartedAt,
    };

    console.log("✅ Machine permission updated:", response);

    console.log("📡 Permission state published:", statePayload);

    if (!permission) {
      console.log(
        "⚠️ Machine is OFF. Please give access to operate the machine.",
      );
    }

    return res.status(200).json({
      success: true,

      message: permission
        ? "Machine permission turned ON."
        : "Machine permission turned OFF.",

      data: response,
    });
  } catch (error) {
    console.error("❌ Set machine permission error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update machine permission.",
      error: error.message,
    });
  }
};

/* =========================================================
   UPDATE MACHINE PRODUCTION
========================================================= */

const updateMachineProduction = async (req, res) => {
  try {
    const { machineId, productionCount } = req.body;

    if (!machineId) {
      return res.status(400).json({
        success: false,
        message: "Machine ID is required.",
      });
    }

    if (
      productionCount === undefined ||
      productionCount === null ||
      Number.isNaN(Number(productionCount)) ||
      Number(productionCount) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Production count must be a valid number.",
      });
    }

    const machine = await findMachineByAnyId(machineId);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: "Machine not found.",
      });
    }

    const newProductionCount = Number(productionCount);

    const previousCount = Number(machine.productionCount) || 0;

    if (newProductionCount < previousCount) {
      return res.status(400).json({
        success: false,
        message:
          "Production count cannot be less than the previous production count.",
      });
    }

    const producedQuantity = newProductionCount - previousCount;

    /*
      IMPORTANT:
      Do NOT use machine.save() here.

      machine.save() validates the complete Machine
      document and can fail if old records are missing
      required fields such as machineName or mqttMachineId.

      updateOne() updates only productionCount.
    */

    await Machine.updateOne(
      {
        _id: machine._id,
      },
      {
        $set: {
          productionCount: newProductionCount,
        },
      },
    );

    const productionLog = await MachineProductionHistory.create({
      machineId: String(machine._id),

      productionCount: newProductionCount,

      previousCount,

      producedQuantity,

      recordedAt: new Date(),
    });

    console.log("\n========================================");

    console.log("✅ MACHINE PRODUCTION UPDATED");

    console.log("========================================");

    console.log("Machine ID:", machine.mqttMachineId);

    console.log("Previous Count:", previousCount);

    console.log("Production Count:", newProductionCount);

    console.log("Produced Quantity:", producedQuantity);

    console.log("Recorded At:", productionLog.recordedAt);

    return res.status(200).json({
      success: true,

      message: "Machine production updated successfully.",

      data: {
        machineId: machine.mqttMachineId,

        productionCount: newProductionCount,

        previousCount,

        producedQuantity,

        recordedAt: productionLog.recordedAt,
      },
    });
  } catch (error) {
    console.error("❌ Machine production update error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update machine production.",
      error: error.message,
    });
  }
};

/* =========================================================
   GET MACHINE PRODUCTION HISTORY
========================================================= */

const getMachineProductionHistory = async (req, res) => {
  try {
    const { machineId } = req.params;

    if (!machineId) {
      return res.status(400).json({
        success: false,
        message: "Machine ID is required.",
      });
    }

    const machine = await findMachineByAnyId(machineId);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: "Machine not found.",
      });
    }

    const history = await MachineProductionHistory.find({
      machineId: String(machine._id),
    }).sort({
      recordedAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("❌ Get machine production history error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get machine production history.",
      error: error.message,
    });
  }
};

/* =========================================================
   GET MACHINE STATUS
========================================================= */

const getMachineStatus = async (req, res) => {
  try {
    const { machineId } = req.params;

    if (!machineId) {
      return res.status(400).json({
        success: false,
        message: "Machine ID is required.",
      });
    }

    const status = machineStatuses[machineId];

    return res.status(200).json({
      success: true,

      data: {
        machineId,

        data: status?.data || null,

        receivedAt: status?.receivedAt || null,

        messageCount: status?.messageCount || 0,
      },
    });
  } catch (error) {
    console.error("❌ Get machine status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get machine status.",
      error: error.message,
    });
  }
};

/* =========================================================
   GET MACHINE STATE
========================================================= */

const getMachineState = async (req, res) => {
  try {
    const { machineId } = req.params;

    if (!machineId) {
      return res.status(400).json({
        success: false,
        message: "Machine ID is required.",
      });
    }

    const machine = await findMachineByAnyId(machineId);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: "Machine state not found.",
      });
    }

    return res.status(200).json({
      success: true,

      data: {
        machineId: machine._id,

        machineName: machine.machineName,

        mqttMachineId: machine.mqttMachineId,

        machineOnline: machine.machineOnline,

        lastSeenAt: machine.lastSeenAt,

        machinePermission: machine.machinePermission,

        machineStatus: machine.machineStatus,

        machineColor: machine.machineColor,

        productionCount: machine.productionCount,

        powerConsumption: machine.powerConsumption,

        powerUnit: machine.powerUnit,

        capacity: machine.capacity,

        capacityUnit: machine.capacityUnit,

        dailyProductionAverage: machine.dailyProductionAverage,

        statusStartedAt: machine.statusStartedAt,
      },
    });
  } catch (error) {
    console.error("❌ Get machine state error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get machine state.",
      error: error.message,
    });
  }
};

/* =========================================================
   GET MACHINE HISTORY
========================================================= */

const getMachineHistory = async (req, res) => {
  try {
    const { machineId } = req.params;

    const { date } = req.query;

    if (!machineId) {
      return res.status(400).json({
        success: false,
        message: "Machine ID is required.",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required. Example: 2026-10-01",
      });
    }

    const machine = await findMachineByAnyId(machineId);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: "Machine not found.",
      });
    }

    const historyIds = [String(machine._id)];

    if (
      machine.mqttMachineId &&
      machine.mqttMachineId !== String(machine._id)
    ) {
      historyIds.push(machine.mqttMachineId);
    }

    const history = await MachineStatusHistory.find({
      machineId: {
        $in: historyIds,
      },

      date,
    }).sort({
      startTime: 1,
    });

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("❌ Get machine history error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get machine history.",
      error: error.message,
    });
  }
};

/* =========================================================
   POWER HISTORY
========================================================= */

const getMachinePowerHistory = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: [],
  });
};

/* =========================================================
   GET ALL MACHINES
========================================================= */

const getAllMachines = async (req, res) => {
  try {
    const machines = await Machine.find({})
      .sort({
        createdAt: 1,
      })
      .lean();

    const formattedMachines = machines.map((machine) => ({
      id: machine._id,

      machineName: machine.machineName,

      mqttMachineId: machine.mqttMachineId,

      machineOnline: Boolean(machine.machineOnline),

      lastSeenAt: machine.lastSeenAt || null,

      machinePermission: Boolean(machine.machinePermission),

      machineStatus: machine.machineStatus || "STOPPED",

      machineColor: machine.machineColor || "RED",

      productionCount: machine.productionCount || 0,

      powerConsumption: machine.powerConsumption || 0,

      powerUnit: machine.powerUnit || "kW",

      capacity: machine.capacity || 0,

      capacityUnit: machine.capacityUnit || "units",

      dailyProductionAverage: machine.dailyProductionAverage || 0,

      statusStartedAt: machine.statusStartedAt || null,

      createdAt: machine.createdAt,

      updatedAt: machine.updatedAt,
    }));

    return res.json({
      success: true,
      data: formattedMachines,
    });
  } catch (error) {
    console.error("❌ Get all machines error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get machines.",
      error: error.message,
    });
  }
};

/* =========================================================
   CREATE MACHINE
========================================================= */

const createMachine = async (req, res) => {
  try {
    const {
      machineName,
      mqttMachineId,
      powerConsumption,
      capacity,
      dailyProductionAverage,
    } = req.body;

    if (!machineName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Machine name is required.",
      });
    }

    if (!mqttMachineId?.trim()) {
      return res.status(400).json({
        success: false,
        message: "MQTT Machine ID is required.",
      });
    }

    const cleanMachineName = machineName.trim();

    const cleanMqttMachineId = mqttMachineId.trim();

    const existing = await Machine.findOne({
      $or: [
        {
          _id: cleanMqttMachineId,
        },
        {
          mqttMachineId: cleanMqttMachineId,
        },
      ],
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A machine with this MQTT ID already exists.",
      });
    }

    const existingName = await Machine.findOne({
      machineName: cleanMachineName,
    });

    if (existingName) {
      return res.status(409).json({
        success: false,
        message: "A machine with this name already exists.",
      });
    }

    const machine = await Machine.create({
      _id: cleanMqttMachineId,

      machineName: cleanMachineName,

      mqttMachineId: cleanMqttMachineId,

      machineOnline: false,

      lastSeenAt: null,

      machinePermission: false,

      machineStatus: "STOPPED",

      machineColor: "RED",

      productionCount: 0,

      powerConsumption: Number(powerConsumption) || 0,

      powerUnit: "kW",

      capacity: Number(capacity) || 0,

      capacityUnit: "units",

      dailyProductionAverage: Number(dailyProductionAverage) || 0,

      statusStartedAt: null,
    });

    return res.status(201).json({
      success: true,

      message: "Machine created successfully.",

      data: {
        id: machine._id,

        machineName: machine.machineName,

        mqttMachineId: machine.mqttMachineId,

        machineOnline: machine.machineOnline,

        lastSeenAt: machine.lastSeenAt,

        machinePermission: machine.machinePermission,

        machineStatus: machine.machineStatus,

        machineColor: machine.machineColor,

        productionCount: machine.productionCount,

        powerConsumption: machine.powerConsumption,

        powerUnit: machine.powerUnit,

        capacity: machine.capacity,

        capacityUnit: machine.capacityUnit,

        dailyProductionAverage: machine.dailyProductionAverage,

        statusStartedAt: machine.statusStartedAt,

        createdAt: machine.createdAt,

        updatedAt: machine.updatedAt,
      },
    });
  } catch (error) {
    console.error("❌ Create machine error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A machine with this ID already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create machine.",
      error: error.message,
    });
  }
};

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  controlMachine,
  setMachinePermission,
  getMachineStatus,
  getMachineState,
  getMachineHistory,
  getMachinePowerHistory,
  updateMachineProduction,
  getMachineProductionHistory,
  getAllMachines,
  createMachine,
};
