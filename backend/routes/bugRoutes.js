
// new code
// const express = require("express");
// const router = express.Router();
// const bugController = require("../controllers/bugController");
// const restrictToRole = require("../middleware/restrictToRole");

// router.post("/projects/:projectId/bugs", restrictToRole("QA"), bugController.createBug);
// router.patch("/bugs/:bugId", restrictToRole("Developer"), bugController.updateBugStatus);
// router.get("/qa-dashboard", restrictToRole("QA"), bugController.getQABugs); // Confirm this line exists and is correct

// module.exports = router;

// code 2
const express = require("express");
const router = express.Router();
const bugController = require("../controllers/bugController");
const restrictToRole = require("../middleware/restrictToRole");

router.post("/projects/:projectId/bugs", restrictToRole("QA"), bugController.createBug);
router.patch("/bugs/:bugId", restrictToRole("Developer"), bugController.updateBugStatus);
router.get("/qa-dashboard", restrictToRole("QA"), bugController.getQABugs); // Confirm this line exists and is correct

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const bugController = require("../controllers/bugController");
// const restrictToRole = require("../middleware/restrictToRole");

// router.post("/projects/:projectId/bugs", restrictToRole("QA"), bugController.createBug);
// router.patch("/bugs/:bugId", restrictToRole("Developer"), bugController.updateBugStatus);

// module.exports = router;
