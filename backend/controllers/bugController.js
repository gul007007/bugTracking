const mongoose = require("mongoose");
const Project = require("../models/Project"); // Ensure this matches the file name exactly (case-sensitive)
const User = require("../models/user");
const Bug = require("../models/bug");
const multer = require("multer");
const path = require("path");
const { log } = require("console");

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /png|gif/;
  const mimetypes = /image\/png|image\/gif/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Error: Images must be PNG or GIF");
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter,
}).single("image");


exports.createBug = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err });
    }

    const { projectId, title, description, deadline, type, status, assignedTo } = req.body;
    const qaId = req.session.user?.id;

    try {
      console.log("Bug Creation Request:", { projectId, qaId, assignedTo }); // Debug: Log incoming data
      if (!projectId) {
        return res.status(400).json({ error: "Project ID is required" });
      }
      if (!qaId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      // Use strings directly or create ObjectId from hex string
      const projectObjectId = mongoose.Types.ObjectId.createFromHexString(projectId);
      const qaObjectId = mongoose.Types.ObjectId.createFromHexString(qaId);

      const project = await Project.findOne({
        _id: projectObjectId,
        qaIds: qaObjectId,
      });
      if (!project) {
        return res.status(403).json({ error: "Project not found or QA not authorized" });
      }

      let image = null;
      if (req.file) {
        image = `/uploads/${req.file.filename}`;
      }

      let assignedToId = null;
      if (assignedTo) {
        const devObjectId = mongoose.Types.ObjectId.createFromHexString(assignedTo);
        const dev = await User.findOne({
          _id: devObjectId,
          role: "Developer",
        });
        if (!dev || !project.developerIds.some((devId) => devId.equals(devObjectId))) {
          return res.status(400).json({ error: "Invalid or unauthorized developer" });
        }
        assignedToId = devObjectId; // Use the ObjectId directly
      }

      const bug = new Bug({
        projectId: projectObjectId,
        title,
        description,
        deadline: deadline ? new Date(deadline) : null,
        image,
        type,
        status,
        assignedTo: assignedToId,
        createdBy: qaObjectId,
      });
      await bug.save();
      res.status(201).json({ message: "Bug created", bugId: bug._id });
    } catch (error) {
      console.error("Error creating bug:", error.message);
      if (error.name === "ValidationError") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Server error: " + error.message });
    }
  });
};


exports.updateBugStatus = async (req, res) => {
  const { bugId } = req.params;
  const { status } = req.body;
  const devId = req.session.user.id;

  try {
    const bug = await Bug.findOne({ _id: bugId, assignedTo: devId });
    if (!bug) {
      return res.status(403).json({ error: "Not authorized or bug not found" });
    }

    bug.status = status;
    bug.updatedAt = new Date();
    await bug.save();
    res.status(200).json({ message: "Bug updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




// exports.getQABugs = async (req, res) => {
//   const qaId = req.session.user?.id;

//   try {
//     if (!qaId) {
//       return res.status(401).json({ error: "User not authenticated" });
//     }
//     console.log("QA Session User ID:", qaId); // Debug: Log QA ID
//     console.log("QA Bugs Query:", { createdBy: mongoose.Types.ObjectId.createFromHexString(qaId) }); // Debug: Log query

//     const bugs = await Bug.find({ createdBy: mongoose.Types.ObjectId.createFromHexString(qaId) })
//       .populate({
//         path: "assignedTo",
//         select: "name email",
//         model: "User",
//       })
//       .populate({
//         path: "projectId",
//         select: "name",
//         model: "Project",
//       })
//       .sort({ updatedAt: -1 }); // Sort by most recent
//     console.log("QA Bugs Found:", bugs); // Debug: Log bugs found

//     if (!bugs.length) {
//       return res.status(200).json({ message: "No bugs created yet", bugs: [] });
//     }
//     res.status(200).json({ bugs });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };



// new code
// exports.getQABugs = async (req, res) => {
//   const qaId = req.session.user?.id;

//   try {
//     console.log("Entering getQABugs - Request URL:", req.url, "Session:", req.session.user); // Debug: Log request and session
//     if (!qaId) {
//       console.log("No QA ID - User not authenticated, Session:", req.session); // Debug: Log session on early exit
//       return res.status(401).json({ error: "User not authenticated" });
//     }
//     console.log("QA Session User ID Type:", typeof qaId, "Value:", qaId); // Debug: Log type and value
//     console.log("QA Bugs Query Before Conversion:", { createdBy: qaId }); // Debug: Log raw query

//     // Convert qaId to ObjectId explicitly
//     const qaObjectId = mongoose.Types.ObjectId.createFromHexString(qaId);
//     console.log("QA ObjectId After Conversion:", qaObjectId); // Debug: Log converted ObjectId

//     const bugs = await Bug.find({ createdBy: qaObjectId })
//       .populate({
//         path: "assignedTo",
//         select: "name email",
//         model: "User",
//       })
//       .populate({
//         path: "projectId",
//         select: "name",
//         model: "Project",
//       })
//       .sort({ updatedAt: -1 }); // Sort by most recent

//     console.log("QA Bugs Found:", bugs); // Debug: Log bugs found

//     if (!bugs.length) {
//       return res.status(200).json({ message: "No bugs created yet", bugs: [] });
//     }
//     res.status(200).json({ bugs }); // Return only bugs
//   } catch (error) {
//     console.error("Error in getQABugs:", error.message, "Stack:", error.stack); // Debug: Log full error
//     if (error.name === "CastError" || error.name === "InvalidObjectIdError") {
//       console.error("ObjectId Conversion Error:", error.message);
//       return res.status(400).json({ error: "Invalid user ID format" });
//     }
//     res.status(500).json({ error: error.message });
//   }
// };

// new code 2
// backend/controllers/bugController.js (update getQABugs)
// exports.getQABugs = async (req, res) => {
//   const qaId = req.session.user?.id;

//   try {
//     console.log("Entering getQABugs - Request URL:", req.url, "Session:", req.session.user); // Debug: Log request and session
//     if (!qaId) {
//       console.log("No QA ID - User not authenticated, Session:", req.session); // Debug: Log session on early exit
//       return res.status(401).json({ error: "User not authenticated" });
//     }
//     console.log("QA Session User ID Type:", typeof qaId, "Value:", qaId); // Debug: Log type and value
//     console.log("QA Bugs Query Before Conversion:", { createdBy: qaId }); // Debug: Log raw query

//     // Convert qaId to ObjectId explicitly
//     const qaObjectId = mongoose.Types.ObjectId.createFromHexString(qaId);
//     console.log("QA ObjectId After Conversion:", qaObjectId); // Debug: Log converted ObjectId

//     const bugs = await Bug.find({ createdBy: qaObjectId })
//       .populate({
//         path: "assignedTo",
//         select: "name email",
//         model: "User",
//       })
//       .populate({
//         path: "projectId",
//         select: "name",
//         model: "Project",
//       })
//       .sort({ updatedAt: -1 }); // Sort by most recent

//     console.log("QA Bugs Found:", bugs); // Debug: Log bugs found

//     if (!bugs.length) {
//       return res.status(200).json({ message: "No bugs created yet", bugs: [] });
//     }
//     res.status(200).json({ bugs }); // Return only bugs
//   } catch (error) {
//     console.error("Error in getQABugs:", error.message, "Stack:", error.stack); // Debug: Log full error
//     if (error.name === "CastError" || error.name === "InvalidObjectIdError") {
//       console.error("ObjectId Conversion Error:", error.message);
//       return res.status(400).json({ error: "Invalid user ID format" });
//     }
//     res.status(500).json({ error: error.message });
//   }
// };

// new code 2.0
exports.getQABugs = async (req, res) => {
  const qaId = req.session.user?.id;

  try {
    console.log("Entering getQABugs - Request URL:", req.url, "Session:", req.session.user); // Debug: Log request and session
    if (!qaId) {
      console.log("No QA ID - User not authenticated, Session:", req.session); // Debug: Log session on early exit
      return res.status(401).json({ error: "User not authenticated" });
    }
    console.log("QA Session User ID Type:", typeof qaId, "Value:", qaId); // Debug: Log type and value
    console.log("QA Bugs Query Before Conversion:", { createdBy: qaId }); // Debug: Log raw query

    // Convert qaId to ObjectId explicitly
    const qaObjectId = mongoose.Types.ObjectId.createFromHexString(qaId);
    console.log("QA ObjectId After Conversion:", qaObjectId); // Debug: Log converted ObjectId

    const bugs = await Bug.find({ createdBy: qaObjectId })
      .populate("assignedTo", "name email")
      .populate("projectId", "name")
      .sort({ updatedAt: -1 }); // Sort by most recent

    console.log("QA Bugs Found:", bugs); // Debug: Log bugs found

    if (!bugs.length) {
      return res.status(200).json({ message: "No bugs created yet", bugs: [] });
    }
    res.status(200).json({ bugs }); // Ensure valid JSON response
  } catch (error) {
    console.error("Error in getQABugs:", error.message, "Stack:", error.stack); // Debug: Log full error
    if (error.name === "CastError" || error.name === "InvalidObjectIdError") {
      console.error("ObjectId Conversion Error:", error.message);
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    res.status(500).json({ error: "Server error: " + error.message }); // Ensure JSON error response
  }
};

// exports.getDevBugs = async (req, res) => {
//   const devId = req.session.user?.id;
//   console.log("Dev ID Type:", typeof devId, "Value:", devId);

//   try {
//     if (!devId) {
//       return res.status(401).json({ error: "User not authenticated" });
//     }
//     console.log("Dev Session User ID:", devId); // Debug: Log Dev ID
//     console.log("Dev Bugs Query:", { assignedTo: mongoose.Types.ObjectId.createFromHexString(devId) }); // Debug: Log query

//     const bugs = await Bug.find({ assignedTo: mongoose.Types.ObjectId.createFromHexString(devId) })
//       .populate({
//         path: "createdBy",
//         select: "name email",
//         model: "User",
//       })
//       .populate({
//         path: "projectId",
//         select: "name",
//         model: "Project",
//       })
//       .sort({ updatedAt: -1 }); // Sort by most recent
//     console.log("Dev Bugs Found:", bugs); // Debug: Log bugs found

//     if (!bugs.length) {
//       return res.status(200).json({ message: "No bugs assigned yet", bugs: [] });
//     }
//     res.status(200).json({ bugs });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


// // new getDevBugs
exports.getDevBugs = async (req, res) => {
  const devId = req.session.user?.id;

  try {
    if (!devId) {
      console.log("No Dev ID - User not authenticated"); // Debug: Log early exit
      return res.status(401).json({ error: "User not authenticated" });
    }
    console.log("Dev Session User ID Type:", typeof devId, "Value:", devId); // Debug: Log type and value
    console.log("Dev Bugs Query Before Conversion:", { assignedTo: devId }); // Debug: Log raw query

    // Convert devId to ObjectId explicitly
    const devObjectId = mongoose.Types.ObjectId.createFromHexString(devId);
    console.log("Dev ObjectId After Conversion:", devObjectId); // Debug: Log converted ObjectId

    const bugs = await Bug.find({ assignedTo: devObjectId })
      .populate({
        path: "createdBy",
        select: "name email",
        model: "User",
      })
      .populate({
        path: "projectId",
        select: "name",
        model: "Project",
      })
      .sort({ updatedAt: -1 }); // Sort by most recent

    console.log("Dev Bugs Found:", bugs); // Debug: Log bugs found

    if (!bugs.length) {
      return res.status(200).json({ message: "No bugs assigned yet", bugs: [] });
    }
    res.status(200).json({ bugs });
  } catch (error) {
    console.error("Error in getDevBugs:", error.message);
    if (error.name === "CastError" || error.name === "InvalidObjectIdError") {
      console.error("ObjectId Conversion Error:", error.message);
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    res.status(500).json({ error: error.message });
  }
};