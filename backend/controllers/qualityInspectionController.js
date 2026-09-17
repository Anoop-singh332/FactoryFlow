const QualityInspection = require("../models/QualityInspection");

// =========================
// CREATE QUALITY INSPECTION
// =========================

const createQualityInspection = async (
  req,
  res
) => {
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
      remarks,
    } = req.body;

    // =========================
    // BASIC VALIDATION
    // =========================

    if (
      !inspectionReport ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
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
          "All required quality inspection fields must be filled.",
      });
    }

    // =========================
    // VALIDATE ITEMS
    // =========================

    for (const item of items) {
      if (
        !item.itemName ||
        item.quantity === undefined ||
        Number(item.quantity) < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each item must have a valid item name and quantity.",
        });
      }
    }

    // =========================
    // CREATE RECORD
    // =========================

    const qualityInspection =
      await QualityInspection.create({
        inspectionReport,
        items,
        vendorName,
        qualityResult,
        invoiceNumber,
        eWayBillNumber:
          eWayBillNumber || "",
        weight,
        numberOfBags,
        deliveryChallan,
        remarks: remarks || "",
        createdBy:
          req.user?._id || null,
      });

    res.status(201).json({
      success: true,
      message:
        "Quality inspection created successfully.",
      data: qualityInspection,
    });
  } catch (error) {
    console.error(
      "Create Quality Inspection Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while creating quality inspection.",
      error: error.message,
    });
  }
};

// =========================
// GET ALL QUALITY INSPECTIONS
// =========================

const getQualityInspections = async (
  req,
  res
) => {
  try {
    const inspections =
      await QualityInspection.find()
        .populate(
          "createdBy",
          "name email role"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      success: true,
      count: inspections.length,
      data: inspections,
    });
  } catch (error) {
    console.error(
      "Get Quality Inspections Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching quality inspections.",
      error: error.message,
    });
  }
};

// =========================
// GET SINGLE QUALITY INSPECTION
// =========================

const getQualityInspection = async (
  req,
  res
) => {
  try {
    const inspection =
      await QualityInspection.findById(
        req.params.id
      ).populate(
        "createdBy",
        "name email role"
      );

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message:
          "Quality inspection not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: inspection,
    });
  } catch (error) {
    console.error(
      "Get Quality Inspection Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching quality inspection.",
      error: error.message,
    });
  }
};

// =========================
// UPDATE QUALITY INSPECTION
// =========================

const updateQualityInspection = async (
  req,
  res
) => {
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
      remarks,
    } = req.body;

    const inspection =
      await QualityInspection.findById(
        req.params.id
      );

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message:
          "Quality inspection not found.",
      });
    }

    // =========================
    // UPDATE FIELDS
    // =========================

    if (
      inspectionReport !== undefined
    ) {
      inspection.inspectionReport =
        inspectionReport;
    }

    if (items !== undefined) {
      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Items must contain at least one item.",
        });
      }

      inspection.items = items;
    }

    if (vendorName !== undefined) {
      inspection.vendorName =
        vendorName;
    }

    if (
      qualityResult !== undefined
    ) {
      inspection.qualityResult =
        qualityResult;
    }

    if (
      invoiceNumber !== undefined
    ) {
      inspection.invoiceNumber =
        invoiceNumber;
    }

    if (
      eWayBillNumber !== undefined
    ) {
      inspection.eWayBillNumber =
        eWayBillNumber;
    }

    if (weight !== undefined) {
      inspection.weight = weight;
    }

    if (
      numberOfBags !== undefined
    ) {
      inspection.numberOfBags =
        numberOfBags;
    }

    if (
      deliveryChallan !== undefined
    ) {
      inspection.deliveryChallan =
        deliveryChallan;
    }

    if (remarks !== undefined) {
      inspection.remarks = remarks;
    }

    const updatedInspection =
      await inspection.save();

    res.status(200).json({
      success: true,
      message:
        "Quality inspection updated successfully.",
      data: updatedInspection,
    });
  } catch (error) {
    console.error(
      "Update Quality Inspection Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while updating quality inspection.",
      error: error.message,
    });
  }
};

// =========================
// DELETE QUALITY INSPECTION
// =========================

const deleteQualityInspection = async (
  req,
  res
) => {
  try {
    const inspection =
      await QualityInspection.findById(
        req.params.id
      );

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message:
          "Quality inspection not found.",
      });
    }

    await inspection.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Quality inspection deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Quality Inspection Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while deleting quality inspection.",
      error: error.message,
    });
  }
};

// =========================
// EXPORT
// =========================

module.exports = {
  createQualityInspection,
  getQualityInspections,
  getQualityInspection,
  updateQualityInspection,
  deleteQualityInspection,
};