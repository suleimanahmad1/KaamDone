const express = require("express");
const {
  createTask,
  getTasks,
  getTask,
  getTaskActivity,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const { taskFilesMiddleware } = require("../middleware/upload");
const {
  createTaskRules,
  updateTaskRules,
  taskIdRules,
  listTasksRules,
} = require("../validators/taskValidators");

const router = express.Router();

function runTaskUpload(req, res, next) {
  taskFilesMiddleware(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}

router.use(protect);

router.get("/", listTasksRules, validate, getTasks);
router.get("/:id/activity", taskIdRules, validate, getTaskActivity);
router.get("/:id", taskIdRules, validate, getTask);
router.post("/", runTaskUpload, createTaskRules, validate, createTask);
router.put("/:id", runTaskUpload, updateTaskRules, validate, updateTask);
router.delete("/:id", taskIdRules, validate, deleteTask);

module.exports = router;
