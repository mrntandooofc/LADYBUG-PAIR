const fs = require('fs').promises;
const path = require('path');
const express = require('express');
const { downloadCreds } = require('../lib');
const router = express.Router();

router.post('/', async (req, res) => {
    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is Required' });
    }

    try {
        if (!sessionId.startsWith('mrntando~')) {
            return res.status(400).json({ 
                valid: false,
                error: 'Invalid Session ID format: Must start with "mrntando~"'
            });
        }

        const decrypted = await downloadCreds(sessionId);
        if (!decrypted) {
            return res.status(400).json({
                valid: false,
                error: 'Session ID not Found in Database or is Invalid'
            });
        }

        const tempDir = path.join(__dirname, 'tmp');
        await fs.mkdir(tempDir, { recursive: true });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const credsPath = path.join(tempDir, `creds-${timestamp}.json`);
        await fs.writeFile(credsPath, JSON.stringify(decrypted, null, 2), 'utf8');
        // console.log("Session File Saved for Inspection:", credsPath);

        const hasAppStateKey = decrypted.myAppStateKeyId && decrypted.myAppStateKeyId.length >= 3;

        const isValid = hasAppStateKey;

        let validationDetails = {
            hasAppStateKey: hasAppStateKey ? '✅ Valid' : '❌ Missing or Invalid'
        };

        const resultMessage = isValid 
            ? '✅ Session ID is Valid. You Can Proceed With Bot Deployment.' 
            : '❌ Incomplete Session Data. The Bot Will Not Respond When Deployed. Please Log Out And Relink.';

        try {
            await fs.unlink(credsPath);
            // console.log('Temporary file deleted');
        } catch (unlinkErr) {
            console.error('Error deleting temporary file:', unlinkErr);
        }

        return res.json({ 
            valid: isValid,
            message: resultMessage,
            details: validationDetails,
            sessionInfo: {
                userId: decrypted.me?.id,
                userName: decrypted.me?.name,
                appStateKeyId: decrypted.myAppStateKeyId
            }
        });

    } catch (error) {
        console.error('Validation error:', error);
        return res.status(500).json({ 
            valid: false,
            error: 'Failed to validate session ID',
            systemError: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                stack: error.stack
            } : undefined
        });
    }
});

module.exports = router;
