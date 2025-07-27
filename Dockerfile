FROM apify/actor-node-puppeteer-chrome:18

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy source code
COPY . .

# Run the actor
CMD [ "npm", "start" ]
