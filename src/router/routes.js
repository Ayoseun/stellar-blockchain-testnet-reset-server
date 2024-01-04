import express from 'express';
import { TestNetController } from '../controller/testnet_controller.js';

const router = express.Router();

// Use the TestNetController function from the imported module
 router.get('/run', TestNetController);


// Base URL route
router.get('/', (req, res) => {
  res.send('Testnet API is live!');
});

// Run route


export default router;
