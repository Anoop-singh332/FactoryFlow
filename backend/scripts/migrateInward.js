require("dotenv").config();

const mongoose = require("mongoose");

const InwardSupply = require("../models/InwardSupply");
const BatchCounter = require("../models/BatchCounter");

const normalizeWeight = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const cleanValue = String(value)
    .trim()
    .replace(/\s*Kg\s*$/i, "");

  const numberValue = Number(cleanValue);

  if (!Number.isFinite(numberValue)) {
    return String(value).trim();
  }

  return `${numberValue} Kg`;
};

const normalizeSize = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const cleanValue = String(value)
    .trim()
    .replace(/\s*mm\s*$/i, "");

  const numberValue = Number(cleanValue);

  if (!Number.isFinite(numberValue)) {
    return String(value).trim();
  }

  return `${numberValue} mm`;
};

const getBatchSequence = (batchNo) => {
  if (!batchNo) {
    return 0;
  }

  const match = String(batchNo).match(
    /^B-\d{4}-(\d+)$/,
  );

  return match ? Number(match[1]) : 0;
};

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected.");

    const records = await InwardSupply.collection
      .find({})
      .sort({
        createdAt: 1,
        _id: 1,
      })
      .toArray();

    console.log(`Found ${records.length} inward records.`);

    let sequence = 0;

    for (const record of records) {
      const existingSequence =
        getBatchSequence(record.batchNo);

      if (existingSequence > sequence) {
        sequence = existingSequence;
      }
    }

    let updatedCount = 0;

    for (const record of records) {
      const updateData = {};

      if (!record.batchNo) {
        sequence += 1;

        const createdDate = record.createdAt
          ? new Date(record.createdAt)
          : new Date();

        const year = createdDate.getFullYear();

        updateData.batchNo = `B-${year}-${String(
          sequence,
        ).padStart(2, "0")}`;
      }

      const formattedWeight =
        normalizeWeight(record.materialWeight);

      if (
        formattedWeight &&
        formattedWeight !== record.materialWeight
      ) {
        updateData.materialWeight =
          formattedWeight;
      }

      const formattedSize =
        normalizeSize(record.materialSize);

      if (
        formattedSize &&
        formattedSize !== record.materialSize
      ) {
        updateData.materialSize =
          formattedSize;
      }

      if (Object.keys(updateData).length > 0) {
        await InwardSupply.collection.updateOne(
          {
            _id: record._id,
          },
          {
            $set: updateData,
          },
        );

        updatedCount += 1;

        console.log(
          `Updated: ${record._id}`,
          updateData,
        );
      }
    }

    await BatchCounter.findOneAndUpdate(
      {
        key: "inward-batch",
      },
      {
        $set: {
          sequence,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    console.log("");
    console.log("Migration completed.");
    console.log(`Records found: ${records.length}`);
    console.log(`Records updated: ${updatedCount}`);
    console.log(`Current batch sequence: ${sequence}`);
  } catch (error) {
    console.error("Migration Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};

migrate();