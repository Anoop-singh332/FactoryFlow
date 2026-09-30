const Vendor = require("../models/Vendor");

// Get all vendors
const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({
      name: 1,
    });

    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors,
    });
  } catch (error) {
    console.error("Get Vendors Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching vendors.",
      error: error.message,
    });
  }
};

// Create vendor
const createVendor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      gstNo,
      address,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !gstNo ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: "All vendor fields are required.",
      });
    }

    const vendorName = name.trim();
    const vendorEmail = email.trim().toLowerCase();
    const vendorPhone = phone.trim();
    const vendorGstNo = gstNo.trim().toUpperCase();
    const vendorAddress = address.trim();

    // Check duplicate vendor name
    const existingVendor = await Vendor.findOne({
      name: {
        $regex: `^${vendorName}$`,
        $options: "i",
      },
    });

    if (existingVendor) {
      return res.status(409).json({
        success: false,
        message: "Vendor with this name already exists.",
      });
    }

    // Check duplicate GST number
    const existingGst = await Vendor.findOne({
      gstNo: vendorGstNo,
    });

    if (existingGst) {
      return res.status(409).json({
        success: false,
        message: "Vendor with this GST number already exists.",
      });
    }

    const vendor = await Vendor.create({
      name: vendorName,
      email: vendorEmail,
      phone: vendorPhone,
      gstNo: vendorGstNo,
      address: vendorAddress,
    });

    res.status(201).json({
      success: true,
      message: "Vendor created successfully.",
      data: vendor,
    });
  } catch (error) {
    console.error("Create Vendor Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating vendor.",
      error: error.message,
    });
  }
};

// Get single vendor
const getVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error("Get Vendor Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching vendor.",
      error: error.message,
    });
  }
};

// Update vendor
const updateVendor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      gstNo,
      address,
    } = req.body;

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }

    if (name !== undefined) {
      vendor.name = name.trim();
    }

    if (email !== undefined) {
      vendor.email = email.trim().toLowerCase();
    }

    if (phone !== undefined) {
      vendor.phone = phone.trim();
    }

    if (gstNo !== undefined) {
      vendor.gstNo = gstNo.trim().toUpperCase();
    }

    if (address !== undefined) {
      vendor.address = address.trim();
    }

    const updatedVendor = await vendor.save();

    res.status(200).json({
      success: true,
      message: "Vendor updated successfully.",
      data: updatedVendor,
    });
  } catch (error) {
    console.error("Update Vendor Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating vendor.",
      error: error.message,
    });
  }
};

// Delete vendor
const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }

    await vendor.deleteOne();

    res.status(200).json({
      success: true,
      message: "Vendor deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Vendor Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting vendor.",
      error: error.message,
    });
  }
};

module.exports = {
  getVendors,
  createVendor,
  getVendor,
  updateVendor,
  deleteVendor,
};