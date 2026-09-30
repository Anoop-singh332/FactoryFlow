const Production = require("../models/Production");

const createProduction = async (req, res) => {
  try {
    const {
      machineNumber,
      productionCount,
    } = req.body;

    if (
      !machineNumber ||
      productionCount === undefined ||
      productionCount === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Machine number and production count are required.",
      });
    }

    const count = Number(productionCount);

    if (!Number.isFinite(count) || count < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Production count must be a valid number.",
      });
    }

    const production = await Production.create({
      machineNumber: machineNumber.trim(),
      productionCount: count,
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
      error,
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while creating production record.",
      error: error.message,
    });
  }
};

const getProductions = async (req, res) => {
  try {
    const productions = await Production.find()
      .populate(
        "createdBy",
        "name email role",
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
      error,
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching production records.",
      error: error.message,
    });
  }
};

const getProduction = async (req, res) => {
  try {
    const production =
      await Production.findById(
        req.params.id,
      ).populate(
        "createdBy",
        "name email role",
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
      error,
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching production record.",
      error: error.message,
    });
  }
};

const updateProduction = async (req, res) => {
  try {
    const {
      machineNumber,
      productionCount,
    } = req.body;

    const production =
      await Production.findById(
        req.params.id,
      );

    if (!production) {
      return res.status(404).json({
        success: false,
        message:
          "Production record not found.",
      });
    }

    if (machineNumber !== undefined) {
      if (!machineNumber.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Machine number cannot be empty.",
        });
      }

      production.machineNumber =
        machineNumber.trim();
    }

    if (productionCount !== undefined) {
      const count = Number(productionCount);

      if (!Number.isFinite(count) || count < 0) {
        return res.status(400).json({
          success: false,
          message:
            "Production count must be a valid number.",
        });
      }

      production.productionCount = count;
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
      error,
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while updating production record.",
      error: error.message,
    });
  }
};

const deleteProduction = async (req, res) => {
  try {
    const production =
      await Production.findById(
        req.params.id,
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
      error,
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