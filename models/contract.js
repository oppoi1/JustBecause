// requirements
const mongoose = require("mongoose");

// mongoose contract model
const contractSchema = new mongoose.Schema({
    title: String,
    contactPerson: String,
    inCharge: String,
    expiration:
    {
        type: Date,
        default: Date.now
    },
    reminderDate:
    {
        type: Date,
        default: Date.now
    },
    category: String,
    created:
    {
        type: Date,
        default: Date.now
    },
    createdBy: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

module.exports = mongoose.model("Contract", contractSchema);