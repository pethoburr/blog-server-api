const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TopicsSchema = new Schema({
    title: { type: String, required: true},
    description: { type: String, required: true}
})

TopicsSchema.virtual("url").get(function() {
    return `/topics/${this._id}`;
})

module.exports = mongoose.model("Topics", TopicsSchema);