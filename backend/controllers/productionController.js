const Production = require("../models/Production");

// =========================
// CREATE PRODUCTION
// =========================

const createProduction = async (req, res) => {
  try {
    const {
      itemName,
      productionProcess,
      numberOfPieces,
      operator,
      machine,
      productionDate,
      shift,
      status,
      notes,
    } = req.body;

    if (
      !itemName ||
      !productionProcess ||
      !numberOfPieces ||
      !operator ||
      !productionDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All required production fields must be filled.",
      });
    }

    const production = await Production.create({
      itemName,
      productionProcess,
      numberOfPieces,
      operator,
      machine: machine || "",
      productionDate,
      shift: shift || "",
      status: status || "In Progress",
      notes: notes || "",
      createdBy: req.user?._id || null,
    });

    res.status(201).json({
      success: true,
      message:
        "Production record created successfully.",
      data: production,
    });
  } catch (error) {
    console.error(
      "Create Production Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while creating production record.",
      error: error.message,
    });
  }
};

// =========================
// GET ALL PRODUCTION
// =========================

const getProductions = async (req, res) => {
  try {
    const productions =
      await Production.find()
        .populate(
          "createdBy",
          "name email role"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      success: true,
      count: productions.length,
      data: productions,
    });
  } catch (error) {
    console.error(
      "Get Productions Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching production records.",
      error: error.message,
    });
  }
};

// =========================
// GET SINGLE PRODUCTION
// =========================

const getProduction = async (req, res) => {
  try {
    const production =
      await Production.findById(
        req.params.id
      ).populate(
        "createdBy",
        "name email role"
      );

    if (!production) {
      return res.status(404).json({
        success: false,
        message:
          "Production record not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: production,
    });
  } catch (error) {
    console.error(
      "Get Production Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching production record.",
      error: error.message,
    });
  }
};

// =========================
// UPDATE PRODUCTION
// =========================

const updateProduction = async (req, res) => {
  try {
    const {
      itemName,
      productionProcess,
      numberOfPieces,
      operator,
      machine,
      productionDate,
      shift,
      status,
      notes,
    } = req.body;

    const production =
      await Production.findById(
        req.params.id
      );

    if (!production) {
      return res.status(404).json({
        success: false,
        message:
          "Production record not found.",
      });
    }

    if (itemName !== undefined) {
      production.itemName = itemName;
    }

    if (
      productionProcess !== undefined
    ) {
      production.productionProcess =
        productionProcess;
    }

    if (
      numberOfPieces !== undefined
    ) {
      production.numberOfPieces =
        numberOfPieces;
    }

    if (operator !== undefined) {
      production.operator = operator;
    }

    if (machine !== undefined) {
      production.machine = machine;
    }

    if (
      productionDate !== undefined
    ) {
      production.productionDate =
        productionDate;
    }

    if (shift !== undefined) {
      production.shift = shift;
    }

    if (status !== undefined) {
      production.status = status;
    }

    if (notes !== undefined) {
      production.notes = notes;
    }

    const updatedProduction =
      await production.save();

    res.status(200).json({
      success: true,
      message:
        "Production record updated successfully.",
      data: updatedProduction,
    });
  } catch (error) {
    console.error(
      "Update Production Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while updating production record.",
      error: error.message,
    });
  }
};

// =========================
// DELETE PRODUCTION
// =========================

const deleteProduction = async (req, res) => {
  try {
    const production =
      await Production.findById(
        req.params.id
      );

    if (!production) {
      return res.status(404).json({
        success: false,
        message:
          "Production record not found.",
      });
    }

    await production.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Production record deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Production Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while deleting production record.",
      error: error.message,
    });
  }
};

module.exports = {
  createProduction,
  getProductions,
  getProduction,
  updateProduction,
  deleteProduction,
};