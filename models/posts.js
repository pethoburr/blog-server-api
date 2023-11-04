const mongoose = require("mongoose");
const { DateTime } = require("luxon")

const Schema = mongoose.Schema;

const PostsSchema = new Schema({
    title: { type: String, required: true},
    author: { type: String, required: true},
    text: { type: String, required: true},
    time: { type: Date },
    topic: { type: Schema.Types.ObjectId, ref: "Topics", required: true},
    published: { type: Boolean, required: true},
    comments: [{ type: Schema.Types.ObjectId, ref: "Comments"}]
})

PostsSchema.virtual("url").get(function() {
    return `/posts/${this._id}`;
})

PostsSchema.virtual("date").get(function() {
    return DateTime.fromMillis(Date.parse(this.time)).toLocaleString(DateTime.DATE_MED)
})

module.exports = mongoose.model("Posts", PostsSchema);