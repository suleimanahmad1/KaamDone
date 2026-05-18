const { body, param, query } = require("express-validator");
const { STATUS_VALUES, PRIORITY_VALUES } = require("../models/Task");

/** Multipart uploads send attachments as a JSON string; JSON bodies use an array. */
const attachmentsBodyRule = body("attachments")
  .optional({ nullable: true })
  .custom((value) => {
    if (value === undefined || value === null || value === "") return true;
    if (Array.isArray(value)) return true;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return true;
      } catch {
        throw new Error("Invalid attachments JSON");
      }
    }
    throw new Error("attachments must be an array");
  });

const createTaskRules = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").optional().isString(),
  body("status").optional().isIn(STATUS_VALUES).withMessage("Invalid status"),
  body("priority").optional().isIn(PRIORITY_VALUES).withMessage("Invalid priority"),
  body("dueDate").optional({ nullable: true }),
  attachmentsBodyRule,
  body("user").not().exists().withMessage("user cannot be set manually"),
];

const updateTaskRules = [
  param("id").isMongoId().withMessage("Invalid task ID"),
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
  body("status").optional().isIn(STATUS_VALUES).withMessage("Invalid status"),
  body("priority").optional().isIn(PRIORITY_VALUES).withMessage("Invalid priority"),
  attachmentsBodyRule,
  body("user").not().exists().withMessage("user cannot be changed"),
];

const taskIdRules = [param("id").isMongoId().withMessage("Invalid task ID")];

const listTasksRules = [
  query("sortBy").optional().isIn(["createdAt", "updatedAt", "dueDate", "priority"]),
  query("sortOrder").optional().isIn(["asc", "desc"]),
];

module.exports = { createTaskRules, updateTaskRules, taskIdRules, listTasksRules };
