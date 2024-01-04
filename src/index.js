import express from 'express';
const app = express();
import testnetRoutes from './router/routes.js';

app.use(express.json());

app.use('/api/testnet', testnetRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
