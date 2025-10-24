
import express from 'express';
import mongoose from 'mongoose';
import checkJwt from '../middleware/auth.js';

const router = express.Router();
const User = mongoose.model('User');

// @route   POST /api/users/sync
// @desc    Synchronize Auth0 user with local DB. Creates user if they don't exist.
// @access  Private
router.post('/sync', checkJwt, async (req, res) => {
    const { auth0Id, email } = req.body;
    const auth0Sub = req.auth.payload.sub;

    // Security check: ensure the auth0Id in the body matches the one in the token
    if (auth0Id !== auth0Sub) {
        return res.status(403).json({ message: 'Forbidden: Token does not match user ID.' });
    }

    if (!auth0Id || !email) {
        return res.status(400).json({ message: 'Auth0 ID and email are required.' });
    }

    try {
        // This query robustly handles user synchronization:
        // 1. It finds a user by EITHER their auth0Id OR their email. This prevents duplicates
        //    if a user signs up with Google and then with email (using the same email address).
        // 2. `$setOnInsert` only sets the email and auth0Id when creating a NEW document.
        // 3. `upsert: true` creates the document if no match is found.
        // 4. `new: true` returns the new or updated document.
        const user = await User.findOneAndUpdate(
            { $or: [{ auth0Id: auth0Id }, { email: email }] },
            { $setOnInsert: { auth0Id: auth0Id, email: email } },
            { new: true, upsert: true }
        );

        console.log(`User synced: ${email}`);
        res.status(200).json({ message: 'User synced successfully.', user });
    } catch (error) {
        // Specifically check for the duplicate key error in a race condition, although less likely now.
        if (error.code === 11000) {
            return res.status(200).json({ message: 'User already exists, sync successful.' });
        }
        console.error('Error during user sync:', error);
        res.status(500).json({ message: 'Server error during user synchronization.' });
    }
});

export default router;