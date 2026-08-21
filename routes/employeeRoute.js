const express = require("express");

const {
  addEmployee,
  getEmployees,
  getEmployeeStats,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/empolyeeController");
const authMiddleware = require("../middleware/authmiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", addEmployee);
router.get("/", getEmployees);
router.get("/stats", getEmployeeStats);
router.get("/:id", getEmployeeById);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

module.exports = router;
