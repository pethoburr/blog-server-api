const mongoose = require("mongoose");
const { DateTime } = require('luxon')

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    time: { type: Date, default: Date.now, required: true},
    text: { type: String, required: true},
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true}
})

CommentSchema.virtual("url").get(function() {
    return `/comments/${this._id}`;
})

CommentSchema.virtual("date").get(function() {
    return DateTime.fromMillis(Date.parse(this.time)).toLocaleString(DateTime.DATETIME_MED)
})

module.exports = mongoose.model("Comments", CommentSchema);