import mongoose from 'mongoose';
const schema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true }, role: { type: String, enum: ['owner', 'admin', 'member'], required: true } }, { timestamps: { createdAt: true, updatedAt: false } });
schema.index({ user: 1, workspace: 1 }, { unique: true });
export default mongoose.model('Membership', schema);
