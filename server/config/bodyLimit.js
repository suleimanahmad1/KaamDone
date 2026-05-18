/** Max JSON body (task + metadata). Attachments use multipart / GridFS. */
const BODY_LIMIT = process.env.BODY_LIMIT || "100mb";

module.exports = { BODY_LIMIT };
