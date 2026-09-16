import mongoose from "mongoose";
import BuyerEnquiry from "../models/BuyerEnquiry.js";
import { isDbConnected } from "../config/db.js";

const OFFLINE_DB_MESSAGE =
  "Enquiry management is temporarily unavailable because the database connection is not available.";

// Allowed status values for admin updates
export const VALID_STATUSES = [
  "New",
  "Contacted",
  "Negotiating",
  "Converted",
  "Closed",
  "Sample / Discussion",
  "Negotiation",
  "Order Confirmed",
];

/**
 * @desc    Get all buyer enquiries for admin (with optional search and status filter)
 * @route   GET /api/admin/enquiries
 * @access  Private (Admin)
 */
export async function getAdminEnquiries(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: OFFLINE_DB_MESSAGE,
        data: [],
      });
    }

    const { status, search } = req.query;
    const query = {};

    // Status filter
    if (status && status.trim() && status.toLowerCase() !== "all") {
      const cleanStatus = status.trim();
      if (cleanStatus === "Negotiating") {
        query.status = { $in: ["Negotiating", "Negotiation", "Sample / Discussion"] };
      } else if (cleanStatus === "Converted") {
        query.status = { $in: ["Converted", "Order Confirmed"] };
      } else if (cleanStatus === "Active") {
        query.status = { $in: ["Contacted", "Negotiating", "Negotiation", "Sample / Discussion"] };
      } else {
        query.status = cleanStatus;
      }
    }

    // Search filter across key buyer fields
    if (search && search.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(safeSearch, "i");
      query.$or = [
        { buyerName: searchRegex },
        { organisationName: searchRegex },
        { email: searchRegex },
        { product: searchRegex },
        { location: searchRegex },
      ];
    }

    const enquiries = await BuyerEnquiry.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get enquiry summary statistics for admin dashboard
 * @route   GET /api/admin/enquiries/stats
 * @access  Private (Admin)
 */
export async function getAdminEnquiryStats(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: OFFLINE_DB_MESSAGE,
        data: { total: 0, new: 0, activeLeads: 0, converted: 0, closed: 0 },
      });
    }

    const [total, newCount, activeLeads, converted, closed] = await Promise.all([
      BuyerEnquiry.countDocuments(),
      BuyerEnquiry.countDocuments({ status: "New" }),
      BuyerEnquiry.countDocuments({
        status: { $in: ["Contacted", "Negotiating", "Negotiation", "Sample / Discussion"] },
      }),
      BuyerEnquiry.countDocuments({
        status: { $in: ["Converted", "Order Confirmed"] },
      }),
      BuyerEnquiry.countDocuments({ status: "Closed" }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        new: newCount,
        activeLeads,
        converted,
        closed,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get single buyer enquiry details including notes
 * @route   GET /api/admin/enquiries/:id
 * @access  Private (Admin)
 */
export async function getAdminEnquiryById(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: OFFLINE_DB_MESSAGE,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry ID format",
      });
    }

    const enquiry = await BuyerEnquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update enquiry status
 * @route   PATCH /api/admin/enquiries/:id/status
 * @access  Private (Admin)
 */
export async function updateAdminEnquiryStatus(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: OFFLINE_DB_MESSAGE,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry ID format",
      });
    }

    const { status } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const enquiry = await BuyerEnquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    enquiry.status = status;
    await enquiry.save();

    res.status(200).json({
      success: true,
      message: `Enquiry status updated to "${status}"`,
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Add internal follow-up note to an enquiry
 * @route   POST /api/admin/enquiries/:id/notes
 * @access  Private (Admin)
 */
export async function addAdminEnquiryNote(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: OFFLINE_DB_MESSAGE,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry ID format",
      });
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Note text is required",
      });
    }

    const enquiry = await BuyerEnquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    const createdBy = req.user?.name || req.user?.email || "Admin";

    const newNote = {
      text: text.trim(),
      createdAt: new Date(),
      createdBy,
    };

    if (!Array.isArray(enquiry.notes)) {
      enquiry.notes = [];
    }

    enquiry.notes.push(newNote);
    await enquiry.save();

    res.status(201).json({
      success: true,
      message: "Follow-up note added successfully",
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get buyer demand insights & procurement discovery analytics
 * @route   GET /api/admin/enquiries/demand-insights
 * @access  Private (Admin)
 */
export async function getAdminDemandInsights(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: OFFLINE_DB_MESSAGE,
        data: {
          summary: {
            totalDemandEnquiries: 0,
            recurringRequirements: 0,
            seasonalRequirements: 0,
            oneTimeRequirements: 0,
          },
          products: [],
          recentDemand: [],
        },
      });
    }

    // 1. Summary counts
    const [
      totalDemandEnquiries,
      recurringRequirements,
      seasonalRequirements,
      oneTimeRequirements,
    ] = await Promise.all([
      BuyerEnquiry.countDocuments(),
      BuyerEnquiry.countDocuments({
        purchaseRequirement: { $regex: /regular|recurring/i },
      }),
      BuyerEnquiry.countDocuments({
        purchaseRequirement: { $regex: /seasonal/i },
      }),
      BuyerEnquiry.countDocuments({
        purchaseRequirement: { $regex: /one-time|onetime/i },
      }),
    ]);

    // 2. Aggregated breakdown by product
    const productAggregation = await BuyerEnquiry.aggregate([
      {
        $group: {
          _id: "$product",
          totalEnquiries: { $sum: 1 },
          recurringCount: {
            $sum: {
              $cond: [
                {
                  $regexMatch: {
                    input: { $ifNull: ["$purchaseRequirement", ""] },
                    regex: /regular|recurring/i,
                  },
                },
                1,
                0,
              ],
            },
          },
          seasonalCount: {
            $sum: {
              $cond: [
                {
                  $regexMatch: {
                    input: { $ifNull: ["$purchaseRequirement", ""] },
                    regex: /seasonal/i,
                  },
                },
                1,
                0,
              ],
            },
          },
          oneTimeCount: {
            $sum: {
              $cond: [
                {
                  $regexMatch: {
                    input: { $ifNull: ["$purchaseRequirement", ""] },
                    regex: /one-time|onetime/i,
                  },
                },
                1,
                0,
              ],
            },
          },
          latestEnquiryDate: { $max: "$createdAt" },
        },
      },
      { $sort: { totalEnquiries: -1, _id: 1 } },
    ]);

    const products = productAggregation.map((p) => ({
      productName: p._id || "Unspecified Product",
      totalEnquiries: p.totalEnquiries,
      recurringCount: p.recurringCount,
      seasonalCount: p.seasonalCount,
      oneTimeCount: p.oneTimeCount,
      latestEnquiryDate: p.latestEnquiryDate,
    }));

    // 3. Recent demand requests
    const recentDemand = await BuyerEnquiry.find({})
      .sort({ createdAt: -1 })
      .limit(6)
      .select(
        "buyerName organisationName product expectedQuantity purchaseRequirement procurementTimeline deliveryLocation createdAt status"
      );

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalDemandEnquiries,
          recurringRequirements,
          seasonalRequirements,
          oneTimeRequirements,
        },
        products,
        recentDemand,
      },
    });
  } catch (error) {
    next(error);
  }
}
