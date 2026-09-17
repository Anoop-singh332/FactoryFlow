const Dispatch = require("../models/Dispatch");

// =========================
// CREATE DISPATCH
// =========================

const createDispatch = async (req, res) => {
  try {
    const {
      inspectionReport,
      items,
      vendorName,
      qualityResult,
      invoiceNumber,
      eWayBillNumber,
      weight,
      numberOfBags,
      deliveryChallan,
    } = req.body;

    // =========================
    // REQUIRED FIELD VALIDATION
    // =========================

    if (
      !inspectionReport ||
      !vendorName ||
      !qualityResult ||
      !invoiceNumber ||
      weight === undefined ||
      numberOfBags === undefined ||
      !deliveryChallan
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required dispatch fields.",
      });
    }

    // =========================
    // ITEMS VALIDATION
    // =========================

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one dispatch item is required.",
      });
    }

    for (const item of items) {
      if (
        !item.itemName ||
        item.quantity === undefined ||
        Number(item.quantity) < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each item must have itemName and a valid quantity.",
        });
      }
    }

    // =========================
    // CREATE DISPATCH
    // =========================

    const dispatch = await Dispatch.create({
      inspectionReport,
      items,
      vendorName,
      qualityResult,
      invoiceNumber,
      eWayBillNumber:
        eWayBillNumber || "",
      weight: Number(weight),
      numberOfBags: Number(numberOfBags),
      deliveryChallan,
      createdBy: req.user?._id || null,
    });

    // =========================
    // RESPONSE
    // =========================

    const populatedDispatch =
      await Dispatch.findById(dispatch._id).populate(
        "createdBy",
        "name email role"
      );

    res.status(201).json({
      success: true,
      message:
        "Dispatch created successfully.",
      data: populatedDispatch,
    });
  } catch (error) {
    console.error(
      "Create Dispatch Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while creating dispatch.",
      error: error.message,
    });
  }
};

// =========================
// GET ALL DISPATCHES
// =========================

const getDispatches = async (req, res) => {
  try {
    const dispatches = await Dispatch.find()
      .populate(
        "createdBy",
        "name email role"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: dispatches.length,
      data: dispatches,
    });
  } catch (error) {
    console.error(
      "Get Dispatches Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching dispatches.",
      error: error.message,
    });
  }
};

// =========================
// GET SINGLE DISPATCH
// =========================

const getDispatch = async (req, res) => {
  try {
    const dispatch = await Dispatch.findById(
      req.params.id
    ).populate(
      "createdBy",
      "name email role"
    );

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message: "Dispatch not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: dispatch,
    });
  } catch (error) {
    console.error(
      "Get Dispatch Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching dispatch.",
      error: error.message,
    });
  }
};

// =========================
// UPDATE DISPATCH
// =========================

const updateDispatch = async (req, res) => {
  try {
    const {
      inspectionReport,
      items,
      vendorName,
      qualityResult,
      invoiceNumber,
      eWayBillNumber,
      weight,
      numberOfBags,
      deliveryChallan,
    } = req.body;

    // =========================
    // REQUIRED FIELD VALIDATION
    // =========================

    if (
      !inspectionReport ||
      !vendorName ||
      !qualityResult ||
      !invoiceNumber ||
      weight === undefined ||
      numberOfBags === undefined ||
      !deliveryChallan
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required dispatch fields.",
      });
    }

    // =========================
    // ITEMS VALIDATION
    // =========================

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one dispatch item is required.",
      });
    }

    for (const item of items) {
      if (
        !item.itemName ||
        item.quantity === undefined ||
        Number(item.quantity) < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each item must have itemName and a valid quantity.",
        });
      }
    }

    // =========================
    // FIND DISPATCH
    // =========================

    const dispatch =
      await Dispatch.findById(
        req.params.id
      );

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message: "Dispatch not found.",
      });
    }

    // =========================
    // UPDATE
    // =========================

    dispatch.inspectionReport =
      inspectionReport;

    dispatch.items = items;

    dispatch.vendorName =
      vendorName;

    dispatch.qualityResult =
      qualityResult;

    dispatch.invoiceNumber =
      invoiceNumber;

    dispatch.eWayBillNumber =
      eWayBillNumber || "";

    dispatch.weight =
      Number(weight);

    dispatch.numberOfBags =
      Number(numberOfBags);

    dispatch.deliveryChallan =
      deliveryChallan;

    await dispatch.save();

    // =========================
    // POPULATE USER
    // =========================

    const updatedDispatch =
      await Dispatch.findById(
        dispatch._id
      ).populate(
        "createdBy",
        "name email role"
      );

    res.status(200).json({
      success: true,
      message:
        "Dispatch updated successfully.",
      data: updatedDispatch,
    });
  } catch (error) {
    console.error(
      "Update Dispatch Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while updating dispatch.",
      error: error.message,
    });
  }
};

// =========================
// DELETE DISPATCH
// =========================

const deleteDispatch = async (req, res) => {
  try {
    const dispatch =
      await Dispatch.findById(
        req.params.id
      );

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message: "Dispatch not found.",
      });
    }

    await Dispatch.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message:
        "Dispatch deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Dispatch Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while deleting dispatch.",
      error: error.message,
    });
  }
};

module.exports = {
  createDispatch,
  getDispatches,
  getDispatch,
  updateDispatch,
  deleteDispatch,
};