const InwardSupply = require("../models/InwardSupply");

// Create inward supply
const createInwardSupply = async (req, res) => {
  try {
    const {
      vendorName,
      invoiceNumber,
      materialWeight,
      materialSize,
      materialType,
      materialItemName,
      receivedBy,
    } = req.body;

    // Validation
    if (
      !vendorName ||
      !invoiceNumber ||
      !materialWeight ||
      !materialSize ||
      !materialType ||
      !materialItemName ||
      !receivedBy
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled.",
      });
    }

    // Uploaded document
    let documentPath = null;

    if (req.file) {
      documentPath = `/uploads/${req.file.filename}`;
    }

    // Create record
    const inwardSupply = await InwardSupply.create({
      vendorName,
      invoiceNumber,
      materialWeight,
      materialSize,
      materialType,
      materialItemName,
      receivedBy,
      document: documentPath,
      createdBy: req.user?._id || null,
    });

    res.status(201).json({
      success: true,
      message: "Inward supply created successfully.",
      data: inwardSupply,
    });
  } catch (error) {
    console.error("Create Inward Supply Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating inward supply.",
      error: error.message,
    });
  }
};

// Get all inward supplies
const getInwardSupplies = async (req, res) => {
  try {
    const inwardSupplies = await InwardSupply.find()
      .populate("createdBy", "name email role")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: inwardSupplies.length,
      data: inwardSupplies,
    });
  } catch (error) {
    console.error("Get Inward Supplies Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching inward supplies.",
      error: error.message,
    });
  }
};

// Get single inward supply
const getInwardSupply = async (req, res) => {
  try {
    const inwardSupply = await InwardSupply.findById(req.params.id).populate(
      "createdBy",
      "name email role",
    );

    if (!inwardSupply) {
      return res.status(404).json({
        success: false,
        message: "Inward supply not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: inwardSupply,
    });
  } catch (error) {
    console.error("Get Single Inward Supply Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching inward supply.",
      error: error.message,
    });
  }
};

// Update inward supply
const updateInwardSupply = async (req, res) => {
  try {
    const {
      vendorName,
      invoiceNumber,
      materialWeight,
      materialSize,
      materialType,
      materialItemName,
      receivedBy,
    } = req.body;

    // Find existing record
    const inwardSupply = await InwardSupply.findById(req.params.id);

    if (!inwardSupply) {
      return res.status(404).json({
        success: false,
        message: "Inward supply not found.",
      });
    }

    // Update fields only when provided
    if (vendorName !== undefined) {
      inwardSupply.vendorName = vendorName;
    }

    if (invoiceNumber !== undefined) {
      inwardSupply.invoiceNumber = invoiceNumber;
    }

    if (materialWeight !== undefined) {
      inwardSupply.materialWeight = materialWeight;
    }

    if (materialSize !== undefined) {
      inwardSupply.materialSize = materialSize;
    }

    if (materialType !== undefined) {
      inwardSupply.materialType = materialType;
    }

    if (materialItemName !== undefined) {
      inwardSupply.materialItemName = materialItemName;
    }

    if (receivedBy !== undefined) {
      inwardSupply.receivedBy = receivedBy;
    }

    // Replace document if new document uploaded
    if (req.file) {
      inwardSupply.document = `/uploads/${req.file.filename}`;
    }

    // Save updated record
    const updatedInwardSupply = await inwardSupply.save();

    res.status(200).json({
      success: true,
      message: "Inward supply updated successfully.",
      data: updatedInwardSupply,
    });
  } catch (error) {
    console.error("Update Inward Supply Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating inward supply.",
      error: error.message,
    });
  }
};

// Delete inward supply
const deleteInwardSupply = async (req, res) => {
  try {
    // Find record
    const inwardSupply = await InwardSupply.findById(req.params.id);

    if (!inwardSupply) {
      return res.status(404).json({
        success: false,
        message: "Inward supply not found.",
      });
    }

    // Delete record
    await inwardSupply.deleteOne();

    res.status(200).json({
      success: true,
      message: "Inward supply deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Inward Supply Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting inward supply.",
      error: error.message,
    });
  }
};

module.exports = {
  createInwardSupply,
  getInwardSupplies,
  getInwardSupply,
  updateInwardSupply,
  deleteInwardSupply,
};
