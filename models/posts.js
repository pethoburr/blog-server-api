const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostsSchema = new Schema({
    title: { type: String, required: true},
    text: { type: String, required: true},
    topic: { type: Schema.Types.ObjectId, ref: "Topics", required: true},
    published: { type: Boolean, required: true},
    comments: [{ type: Schema.Types.ObjectId, ref: "Comments"}]
})

PostsSchema.virtual("url").get(function() {
    return `/posts/${this._id}`;
})

module.exports = mongoose.model("Posts", PostsSchema);