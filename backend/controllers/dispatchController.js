const Dispatch = require("../models/Dispatch");

// Create dispatch
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

    // Required field validation
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
        message: "Please provide all required dispatch fields.",
      });
    }

    // Items validation
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one dispatch item is required.",
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
          message: "Each item must have itemName and a valid quantity.",
        });
      }
    }

    // Create dispatch
    const dispatch = await Dispatch.create({
      inspectionReport,
      items,
      vendorName,
      qualityResult,
      invoiceNumber,
      eWayBillNumber: eWayBillNumber || "",
      weight: Number(weight),
      numberOfBags: Number(numberOfBags),
      deliveryChallan,
      createdBy: req.user?._id || null,
    });

    // Get created dispatch with user details
    const populatedDispatch = await Dispatch.findById(dispatch._id).populate(
      "createdBy",
      "name email role",
    );

    res.status(201).json({
      success: true,
      message: "Dispatch created successfully.",
      data: populatedDispatch,
    });
  } catch (error) {
    console.error("Create Dispatch Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating dispatch.",
      error: error.message,
    });
  }
};

// Get all dispatches
const getDispatches = async (req, res) => {
  try {
    const dispatches = await Dispatch.find()
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: dispatches.length,
      data: dispatches,
    });
  } catch (error) {
    console.error("Get Dispatches Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching dispatches.",
      error: error.message,
    });
  }
};

// Get single dispatch
const getDispatch = async (req, res) => {
  try {
    const dispatch = await Dispatch.findById(req.params.id).populate(
      "createdBy",
      "name email role",
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
    console.error("Get Dispatch Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching dispatch.",
      error: error.message,
    });
  }
};

// Update dispatch
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

    // Required field validation
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
        message: "Please provide all required dispatch fields.",
      });
    }

    // Items validation
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one dispatch item is required.",
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
          message: "Each item must have itemName and a valid quantity.",
        });
      }
    }

    // Find dispatch
    const dispatch = await Dispatch.findById(req.params.id);

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message: "Dispatch not found.",
      });
    }

    // Update dispatch
    dispatch.inspectionReport = inspectionReport;

    dispatch.items = items;

    dispatch.vendorName = vendorName;

    dispatch.qualityResult = qualityResult;

    dispatch.invoiceNumber = invoiceNumber;

    dispatch.eWayBillNumber = eWayBillNumber || "";

    dispatch.weight = Number(weight);

    dispatch.numberOfBags = Number(numberOfBags);

    dispatch.deliveryChallan = deliveryChallan;

    await dispatch.save();

    // Get updated dispatch with user details
    const updatedDispatch = await Dispatch.findById(dispatch._id).populate(
      "createdBy",
      "name email role",
    );

    res.status(200).json({
      success: true,
      message: "Dispatch updated successfully.",
      data: updatedDispatch,
    });
  } catch (error) {
    console.error("Update Dispatch Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating dispatch.",
      error: error.message,
    });
  }
};

// Delete dispatch
const deleteDispatch = async (req, res) => {
  try {
    const dispatch = await Dispatch.findById(req.params.id);

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message: "Dispatch not found.",
      });
    }

    await Dispatch.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Dispatch deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Dispatch Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting dispatch.",
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
