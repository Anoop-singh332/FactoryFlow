const InwardSupply = require("../models/InwardSupply");
const Vendor = require("../models/Vendor");

/*
|--------------------------------------------------------------------------
| NORMALIZE WEIGHT
|--------------------------------------------------------------------------
*/

const normalizeWeight = (value) => {
  const cleanValue = String(value)
    .trim()
    .replace(/\s*Kg\s*$/i, "");

  const numberValue = Number(cleanValue);

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    throw new Error(
      "Material weight must be a valid number greater than 0.",
    );
  }

  return `${numberValue} Kg`;
};

/*
|--------------------------------------------------------------------------
| NORMALIZE SIZE
|--------------------------------------------------------------------------
*/

const normalizeSize = (value) => {
  const cleanValue = String(value)
    .trim()
    .replace(/\s*mm\s*$/i, "");

  const numberValue = Number(cleanValue);

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    throw new Error(
      "Material size must be a valid number greater than 0.",
    );
  }

  return `${numberValue} mm`;
};

/*
|--------------------------------------------------------------------------
| GENERATE BATCH NUMBER
|--------------------------------------------------------------------------
|
| Rules:
|
| No records:
| B-2026-01
|
| Existing:
| B-2026-01
| B-2026-02
| B-2026-03
|
| Next:
| B-2026-04
|
| If B-2026-02 is deleted:
| Next:
| B-2026-02
|
| If everything is deleted:
| Next:
| B-2026-01
|
*/

const generateBatchNo = async () => {
  const currentYear = new Date().getFullYear();

  const records = await InwardSupply.find(
    {},
    {
      batchNo: 1,
    },
  ).lean();

  const usedNumbers = new Set();

  records.forEach((record) => {
    const match = String(record.batchNo || "").match(
      /^B-\d{4}-(\d+)$/,
    );

    if (!match) {
      return;
    }

    const sequenceNumber = Number(match[1]);

    if (
      Number.isInteger(sequenceNumber) &&
      sequenceNumber > 0
    ) {
      usedNumbers.add(sequenceNumber);
    }
  });

  let nextNumber = 1;

  while (usedNumbers.has(nextNumber)) {
    nextNumber++;
  }

  return `B-${currentYear}-${String(nextNumber).padStart(
    2,
    "0",
  )}`;
};

/*
|--------------------------------------------------------------------------
| CREATE INWARD SUPPLY
|--------------------------------------------------------------------------
*/

const createInwardSupply = async (req, res) => {
  try {
    const {
      vendorName,
      invoiceNumber,
      numberOfItems,
      materialWeight,
      materialSize,
      materialType,
      materialItemName,
      receivedBy,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | REQUIRED FIELD VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      !vendorName ||
      !invoiceNumber ||
      !numberOfItems ||
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

    /*
    |--------------------------------------------------------------------------
    | NUMBER OF ITEMS
    |--------------------------------------------------------------------------
    */

    const itemCount = Number(numberOfItems);

    if (
      !Number.isInteger(itemCount) ||
      itemCount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Number of items must be a whole number greater than 0.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | NORMALIZE WEIGHT AND SIZE
    |--------------------------------------------------------------------------
    */

    const formattedWeight =
      normalizeWeight(materialWeight);

    const formattedSize =
      normalizeSize(materialSize);

    const trimmedVendor =
      vendorName.trim();

    /*
    |--------------------------------------------------------------------------
    | SAVE / UPDATE VENDOR
    |--------------------------------------------------------------------------
    */

    await Vendor.findOneAndUpdate(
      {
        name: {
          $regex: `^${trimmedVendor}$`,
          $options: "i",
        },
      },
      {
        name: trimmedVendor,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    /*
    |--------------------------------------------------------------------------
    | DOCUMENT
    |--------------------------------------------------------------------------
    */

    let documentPath = null;

    if (req.file) {
      documentPath =
        `/uploads/${req.file.filename}`;
    }

    /*
    |--------------------------------------------------------------------------
    | GENERATE BATCH NUMBER
    |--------------------------------------------------------------------------
    */

    const batchNo =
      await generateBatchNo();

    /*
    |--------------------------------------------------------------------------
    | CREATE INWARD RECORD
    |--------------------------------------------------------------------------
    */

    const inwardSupply =
      await InwardSupply.create({
        batchNo,

        vendorName:
          trimmedVendor,

        invoiceNumber:
          invoiceNumber.trim(),

        numberOfItems:
          itemCount,

        materialWeight:
          formattedWeight,

        materialSize:
          formattedSize,

        materialType:
          materialType.trim(),

        materialItemName:
          materialItemName.trim(),

        receivedBy:
          receivedBy.trim(),

        document:
          documentPath,

        createdBy:
          req.user?._id || null,
      });

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    res.status(201).json({
      success: true,
      message:
        "Inward supply created successfully.",
      data: inwardSupply,
    });
  } catch (error) {
    console.error(
      "Create Inward Supply Error:",
      error,
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while creating inward supply.",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL INWARD SUPPLIES
|--------------------------------------------------------------------------
*/

const getInwardSupplies = async (
  req,
  res,
) => {
  try {
    const inwardSupplies =
      await InwardSupply.find()
        .populate(
          "createdBy",
          "name email role",
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      success: true,
      count:
        inwardSupplies.length,
      data:
        inwardSupplies,
    });
  } catch (error) {
    console.error(
      "Get Inward Supplies Error:",
      error,
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching inward supplies.",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE INWARD SUPPLY
|--------------------------------------------------------------------------
*/

const getInwardSupply = async (
  req,
  res,
) => {
  try {
    const inwardSupply =
      await InwardSupply.findById(
        req.params.id,
      ).populate(
        "createdBy",
        "name email role",
      );

    if (!inwardSupply) {
      return res.status(404).json({
        success: false,
        message:
          "Inward supply not found.",
      });
    }

    res.status(200).json({
      success: true,
      data:
        inwardSupply,
    });
  } catch (error) {
    console.error(
      "Get Single Inward Supply Error:",
      error,
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching inward supply.",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE INWARD SUPPLY
|--------------------------------------------------------------------------
*/

const updateInwardSupply = async (
  req,
  res,
) => {
  try {
    const {
      vendorName,
      invoiceNumber,
      numberOfItems,
      materialWeight,
      materialSize,
      materialType,
      materialItemName,
      receivedBy,
    } = req.body;

    const inwardSupply =
      await InwardSupply.findById(
        req.params.id,
      );

    if (!inwardSupply) {
      return res.status(404).json({
        success: false,
        message:
          "Inward supply not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VENDOR
    |--------------------------------------------------------------------------
    */

    if (
      vendorName !== undefined
    ) {
      const trimmedVendor =
        vendorName.trim();

      inwardSupply.vendorName =
        trimmedVendor;

      if (trimmedVendor) {
        await Vendor.findOneAndUpdate(
          {
            name: {
              $regex: `^${trimmedVendor}$`,
              $options: "i",
            },
          },
          {
            name: trimmedVendor,
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          },
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | INVOICE
    |--------------------------------------------------------------------------
    */

    if (
      invoiceNumber !== undefined
    ) {
      inwardSupply.invoiceNumber =
        invoiceNumber.trim();
    }

    /*
    |--------------------------------------------------------------------------
    | NUMBER OF ITEMS
    |--------------------------------------------------------------------------
    */

    if (
      numberOfItems !== undefined
    ) {
      const itemCount =
        Number(numberOfItems);

      if (
        !Number.isInteger(itemCount) ||
        itemCount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Number of items must be a whole number greater than 0.",
        });
      }

      inwardSupply.numberOfItems =
        itemCount;
    }

    /*
    |--------------------------------------------------------------------------
    | WEIGHT
    |--------------------------------------------------------------------------
    */

    if (
      materialWeight !== undefined
    ) {
      inwardSupply.materialWeight =
        normalizeWeight(
          materialWeight,
        );
    }

    /*
    |--------------------------------------------------------------------------
    | SIZE
    |--------------------------------------------------------------------------
    */

    if (
      materialSize !== undefined
    ) {
      inwardSupply.materialSize =
        normalizeSize(
          materialSize,
        );
    }

    /*
    |--------------------------------------------------------------------------
    | MATERIAL TYPE
    |--------------------------------------------------------------------------
    */

    if (
      materialType !== undefined
    ) {
      inwardSupply.materialType =
        materialType.trim();
    }

    /*
    |--------------------------------------------------------------------------
    | ITEM NAME
    |--------------------------------------------------------------------------
    */

    if (
      materialItemName !== undefined
    ) {
      inwardSupply.materialItemName =
        materialItemName.trim();
    }

    /*
    |--------------------------------------------------------------------------
    | RECEIVED BY
    |--------------------------------------------------------------------------
    */

    if (
      receivedBy !== undefined
    ) {
      inwardSupply.receivedBy =
        receivedBy.trim();
    }

    /*
    |--------------------------------------------------------------------------
    | DOCUMENT
    |--------------------------------------------------------------------------
    */

    if (req.file) {
      inwardSupply.document =
        `/uploads/${req.file.filename}`;
    }

    /*
    |--------------------------------------------------------------------------
    | SAVE
    |--------------------------------------------------------------------------
    */

    const updatedInwardSupply =
      await inwardSupply.save();

    res.status(200).json({
      success: true,
      message:
        "Inward supply updated successfully.",
      data:
        updatedInwardSupply,
    });
  } catch (error) {
    console.error(
      "Update Inward Supply Error:",
      error,
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while updating inward supply.",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE INWARD SUPPLY
|--------------------------------------------------------------------------
*/

const deleteInwardSupply = async (
  req,
  res,
) => {
  try {
    const inwardSupply =
      await InwardSupply.findById(
        req.params.id,
      );

    if (!inwardSupply) {
      return res.status(404).json({
        success: false,
        message:
          "Inward supply not found.",
      });
    }

    await inwardSupply.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Inward supply deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Inward Supply Error:",
      error,
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while deleting inward supply.",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

module.exports = {
  createInwardSupply,
  getInwardSupplies,
  getInwardSupply,
  updateInwardSupply,
  deleteInwardSupply,
};