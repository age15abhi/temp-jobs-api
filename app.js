require('dotenv').config();
require('express-async-errors');

// Extra security pakages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');


const express = require('express');
const app = express();


// Connect DB
const connectDB = require('./db/connect')

const authenticateUser = require('./middleware/authentication')

// Routers
const authrouter = require('./routes/auth')
const jobsrouter = require('./routes/jobs')


// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(express.json());

// extra packages
// apply to all request so we use app.use
app.set('trust proxy' , 1);
app.use(rateLimiter({

	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
})
);

app.use(helmet());
app.use(cors());
app.use(xss());

// routes
app.use('/api/v1/auth' , authrouter)
app.use('/api/v1/jobs' ,authenticateUser , jobsrouter)

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
