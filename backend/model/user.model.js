import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, minlength: 6 },
        events_registered: [{
             type: mongoose.Schema.Types.ObjectId,
             ref: 'Event',
             default: [], 
            }],
        events_created: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Event',
            default: [],
        }],
    }
);
const User= mongoose.model('User', userSchema);
export default User;