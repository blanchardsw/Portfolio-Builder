import express from 'express';

const router: express.Router = express.Router();

/**
 * Validate owner access key
 * The secret key is stored only in environment variables, never exposed to client
 */
router.post('/validate-owner', (req, res) => {
  try {
    const { key } = req.body;
    
    // Get the secret key from environment variable
    const ownerKey = process.env.OWNER_SECRET_KEY || 'default-secret-change-me';
    
    // Validate the provided key
    const isValid = key === ownerKey;
    
    // Return validation result without exposing the actual key
    res.json({ 
      isOwner: isValid,
      message: isValid ? 'Owner access granted' : 'Invalid access key'
    });
    
    // Log access attempts for security monitoring
    console.log(`[AUTH] Owner access attempt: ${isValid ? 'SUCCESS' : 'FAILED'} at ${new Date().toISOString()}`);
    
  } catch (error) {
    console.error('Error validating owner key:', error);
    res.status(500).json({ 
      isOwner: false, 
      message: 'Authentication error' 
    });
  }
});

/**
 * Check if a key parameter in URL is valid (for direct URL access)
 */
router.get('/check-owner/:key', (req, res) => {
  try {
    const { key } = req.params;
    
    // Get the secret key from environment variable
    const ownerKey = process.env.OWNER_SECRET_KEY || 'default-secret-change-me';
    
    // Validate the provided key
    const isValid = key === ownerKey;
    
    res.json({ 
      isOwner: isValid,
      message: isValid ? 'Owner access granted' : 'Invalid access key'
    });
    
    console.log(`[AUTH] Owner URL access attempt: ${isValid ? 'SUCCESS' : 'FAILED'} at ${new Date().toISOString()}`);
    
  } catch (error) {
    console.error('Error validating owner key:', error);
    res.status(500).json({ 
      isOwner: false, 
      message: 'Authentication error' 
    });
  }
});

export default router;
