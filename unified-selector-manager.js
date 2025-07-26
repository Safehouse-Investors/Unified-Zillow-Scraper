import OpenAI from 'openai';
import * as cheerio from 'cheerio';

/**
 * Unified Selector Manager for Comprehensive Zillow Scraping
 * Handles both search results and property detail pages with AI-powered adaptation
 */
export class UnifiedSelectorManager {
    constructor(options = {}) {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: process.env.OPENAI_API_BASE
        });
        
        // Search result selectors
        this.searchSelectors = {
            propertyCards: [
                '[data-testid="property-card"]',
                '.property-card',
                '.list-card',
                '.search-result',
                'article[data-zpid]',
                '[class*="property"]',
                '.result-item'
            ],
            propertyLinks: [
                '[data-testid="property-card"] a[href*="/homedetails/"]',
                '.property-card a[href*="/homedetails/"]',
                '.list-card a[href*="/homedetails/"]',
                'a[href*="/homedetails/"]',
                '[data-zpid] a',
                '.property-link'
            ],
            searchAddresses: [
                '[data-testid="property-card"] address',
                '.property-card .address',
                '.list-card .address',
                '[data-testid="address"]',
                '.property-address',
                '.listing-address'
            ],
            searchPrices: [
                '[data-testid="property-card"] [data-testid="price"]',
                '.property-card .price',
                '.list-card .price',
                '[class*="price"]:not([class*="history"])',
                '.property-price',
                '.listing-price'
            ],
            nextPageButton: [
                '[data-testid="pagination-next-page"]',
                '.pagination-next',
                'a[aria-label="Next page"]',
                '.next-page',
                '[class*="next"]'
            ]
        };

        // Property detail selectors
        this.detailSelectors = {
            address: [
                'h1[data-testid="home-details-address"]',
                '.summary-container h1',
                '.property-summary h1',
                'h1.notranslate',
                '.address h1',
                '.property-address h1'
            ],
            price: [
                'span[data-testid="price"]',
                '.summary-container .notranslate',
                '.price-section .notranslate',
                '.home-summary-price',
                '.property-price .notranslate',
                '[class*="price"] .notranslate'
            ],
            beds: [
                'span[data-testid="bed-count"]',
                '.summary-container span:contains("bd")',
                '.property-meta span:contains("bed")',
                '.bed-bath-beyond span:first-child',
                '[class*="bed"]'
            ],
            baths: [
                'span[data-testid="bath-count"]',
                '.summary-container span:contains("ba")',
                '.property-meta span:contains("bath")',
                '.bed-bath-beyond span:nth-child(2)',
                '[class*="bath"]'
            ],
            sqft: [
                'span[data-testid="home-size"]',
                '.summary-container span:contains("sqft")',
                '.property-meta span:contains("sqft")',
                '.bed-bath-beyond span:last-child',
                '[class*="sqft"]'
            ],
            description: [
                '[data-testid="home-description-text-description-text"]',
                '.property-description',
                '.home-description',
                '.listing-description',
                '[class*="description"] p',
                '.remarks'
            ],
            zestimate: [
                'span[data-testid="zestimate-text-value-label"]',
                '.zestimate-value',
                '.estimate-value',
                '[class*="zestimate"]',
                '[class*="estimate"]'
            ],
            agentName: [
                '.agent-name',
                '[data-testid="attribution-AGENT"] .Text-c11n-8-84-3__sc-aiai24-0',
                '.listing-agent-name',
                '.agent-info .name',
                '[class*="agent"] .name'
            ],
            agentPhone: [
                'a[href^="tel:"]',
                '.agent-phone',
                '.contact-phone',
                '[class*="phone"]',
                '.agent-contact-phone'
            ],
            images: [
                'ul.media-stream-photo-list img',
                '.property-photos img',
                '.photo-gallery img',
                '.listing-photos img',
                '.media-stream img'
            ],
            propertyType: [
                '[data-testid="property-type"]',
                '.property-type',
                '.home-type',
                '.listing-type'
            ],
            yearBuilt: [
                '[data-testid="year-built"]',
                '.year-built',
                '.built-year',
                '.construction-year'
            ],
            lotSize: [
                '[data-testid="lot-size"]',
                '.lot-size',
                '.land-size',
                '.property-lot'
            ]
        };

        // Flexible patterns for dynamic matching
        this.flexiblePatterns = {
            price: /price|cost|amount|\$|dollar/i,
            address: /address|location|street|home/i,
            bed: /bed|bedroom|br\b/i,
            bath: /bath|bathroom|ba\b/i,
            sqft: /sqft|square|footage|sf\b/i,
            description: /description|about|details|remarks/i,
            agent: /agent|realtor|broker|contact/i,
            phone: /phone|tel|call|contact/i,
            image: /photo|image|picture|media/i
        };

        this.selectorCache = new Map();
        this.failureCount = new Map();
        this.performanceStats = {
            cacheHits: 0,
            cacheMisses: 0,
            aiCalls: 0,
            successfulExtractions: 0,
            failedExtractions: 0
        };
    }

    /**
     * Extract data from search results page
     */
    async extractSearchResults(page, url) {
        const results = [];
        
        try {
            // Get property card containers
            const propertyCards = await this.findElements(page, 'propertyCards', url, 'search');
            
            if (!propertyCards || propertyCards.length === 0) {
                console.warn('No property cards found on search results page');
                return results;
            }

            console.log(`Found ${propertyCards.length} property cards`);

            // Extract data from each property card
            for (let i = 0; i < propertyCards.length; i++) {
                try {
                    const propertyData = await this.extractSearchCardData(page, i, url);
                    if (propertyData) {
                        results.push(propertyData);
                    }
                } catch (error) {
                    console.warn(`Failed to extract data from property card ${i}: ${error.message}`);
                    this.performanceStats.failedExtractions++;
                }
            }

        } catch (error) {
            console.error(`Failed to extract search results: ${error.message}`);
            this.performanceStats.failedExtractions++;
        }

        return results;
    }

    /**
     * Extract data from property detail page
     */
    async extractPropertyDetails(page, url) {
        const propertyData = {};

        try {
            // Extract all detail fields
            const fields = ['address', 'price', 'beds', 'baths', 'sqft', 'description', 
                          'zestimate', 'agentName', 'agentPhone', 'propertyType', 'yearBuilt', 'lotSize'];

            for (const field of fields) {
                try {
                    const value = await this.extractField(page, field, url, 'detail');
                    if (value !== null && value !== undefined) {
                        propertyData[field] = value;
                    }
                } catch (error) {
                    console.warn(`Failed to extract ${field}: ${error.message}`);
                }
            }

            // Extract images separately
            try {
                const images = await this.extractImages(page, url);
                if (images && images.length > 0) {
                    propertyData.images = images;
                    propertyData.imageCount = images.length;
                }
            } catch (error) {
                console.warn(`Failed to extract images: ${error.message}`);
            }

            // Extract additional contact information
            try {
                const additionalContacts = await this.extractAdditionalContacts(page);
                Object.assign(propertyData, additionalContacts);
            } catch (error) {
                console.warn(`Failed to extract additional contacts: ${error.message}`);
            }

            this.performanceStats.successfulExtractions++;

        } catch (error) {
            console.error(`Failed to extract property details: ${error.message}`);
            this.performanceStats.failedExtractions++;
        }

        return propertyData;
    }

    /**
     * Extract data from a search result property card
     */
    async extractSearchCardData(page, cardIndex, url) {
        const propertyData = {};

        try {
            // Extract property URL
            const propertyUrl = await this.extractFromCard(page, cardIndex, 'propertyLinks', url, 'href');
            if (propertyUrl) {
                propertyData.url = this.normalizeUrl(propertyUrl);
                propertyData.zpid = this.extractZpidFromUrl(propertyData.url);
            }

            // Extract address
            const address = await this.extractFromCard(page, cardIndex, 'searchAddresses', url, 'text');
            if (address) {
                propertyData.address = address.trim();
            }

            // Extract price
            const price = await this.extractFromCard(page, cardIndex, 'searchPrices', url, 'text');
            if (price) {
                propertyData.price = this.cleanPrice(price);
            }

            // Extract property details from card
            const details = await this.extractFromCard(page, cardIndex, 'propertyDetails', url, 'text');
            if (details) {
                const parsedDetails = this.parsePropertyDetails(details);
                Object.assign(propertyData, parsedDetails);
            }

            // Add metadata
            propertyData.extractedAt = new Date().toISOString();
            propertyData.searchUrl = url;
            propertyData.extractionMethod = 'search-card';

            return propertyData;

        } catch (error) {
            console.warn(`Failed to extract search card data: ${error.message}`);
            return null;
        }
    }

    /**
     * Extract specific field from property detail page
     */
    async extractField(page, fieldName, url, pageType = 'detail') {
        const selectors = pageType === 'search' ? 
            this.searchSelectors[fieldName] : 
            this.detailSelectors[fieldName];

        if (!selectors) return null;

        // Try cached selector first
        const cacheKey = `${pageType}-${fieldName}-${this.getUrlPattern(url)}`;
        if (this.selectorCache.has(cacheKey)) {
            const cachedSelector = this.selectorCache.get(cacheKey);
            try {
                const result = await this.trySelector(page, cachedSelector, fieldName);
                if (result) {
                    this.performanceStats.cacheHits++;
                    return result;
                }
            } catch (error) {
                this.selectorCache.delete(cacheKey);
            }
        }

        // Try hierarchical selectors
        for (const selector of selectors) {
            try {
                const result = await this.trySelector(page, selector, fieldName);
                if (result) {
                    this.selectorCache.set(cacheKey, selector);
                    this.performanceStats.cacheMisses++;
                    return result;
                }
            } catch (error) {
                continue;
            }
        }

        // Try AI-powered selector generation
        if (this.openai) {
            try {
                const aiResult = await this.tryAISelector(page, fieldName, url, pageType);
                if (aiResult) {
                    this.performanceStats.aiCalls++;
                    return aiResult;
                }
            } catch (error) {
                console.warn(`AI extraction failed for ${fieldName}: ${error.message}`);
            }
        }

        return null;
    }

    /**
     * Try a specific selector
     */
    async trySelector(page, selector, fieldName) {
        try {
            const element = await page.$(selector);
            if (!element) return null;

            let result;
            if (fieldName === 'agentPhone') {
                result = await element.evaluate(el => el.href || el.textContent?.trim());
                if (result && result.startsWith('tel:')) {
                    result = result.replace('tel:', '');
                }
            } else {
                result = await element.evaluate(el => el.textContent?.trim());
            }

            return result && result.length > 0 ? result : null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Try AI-powered selector generation
     */
    async tryAISelector(page, fieldName, url, pageType) {
        try {
            const html = await page.content();
            const prompt = this.buildAIPrompt(fieldName, html, pageType);
            
            const response = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert web scraper. Analyze the HTML and provide a CSS selector to extract the requested data. Return only the CSS selector, nothing else."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 100,
                temperature: 0
            });

            const aiSelector = response.choices[0]?.message?.content?.trim();
            
            if (aiSelector && aiSelector.length > 0) {
                console.log(`AI generated selector for ${fieldName}: ${aiSelector}`);
                const result = await this.trySelector(page, aiSelector, fieldName);
                if (result) {
                    // Cache the successful AI selector
                    const cacheKey = `${pageType}-${fieldName}-${this.getUrlPattern(url)}`;
                    this.selectorCache.set(cacheKey, aiSelector);
                    return result;
                }
            }
        } catch (error) {
            console.warn(`AI selector generation failed: ${error.message}`);
        }

        return null;
    }

    /**
     * Build AI prompt for selector generation
     */
    buildAIPrompt(fieldName, html, pageType) {
        const truncatedHtml = html.length > 8000 ? html.substring(0, 8000) + '...' : html;
        
        const fieldDescriptions = {
            // Detail page fields
            address: "property address or street address",
            price: "property listing price or asking price",
            beds: "number of bedrooms",
            baths: "number of bathrooms",
            sqft: "square footage or property size",
            description: "property description or listing details",
            zestimate: "Zestimate value or estimated price",
            agentName: "real estate agent name",
            agentPhone: "agent phone number or contact",
            propertyType: "property type (house, condo, etc.)",
            yearBuilt: "year the property was built",
            lotSize: "lot size or land area",
            
            // Search page fields
            propertyCards: "property listing containers or cards",
            propertyLinks: "links to individual property detail pages",
            searchAddresses: "property addresses in search results",
            searchPrices: "property prices in search results",
            nextPageButton: "next page button for pagination"
        };

        const description = fieldDescriptions[fieldName] || fieldName;
        const context = pageType === 'search' ? 'Zillow search results page' : 'Zillow property detail page';

        return `Find a CSS selector for ${description} in this ${context} HTML:

${truncatedHtml}

Return only the CSS selector that would find ${description}.`;
    }

    /**
     * Extract from property card in search results
     */
    async extractFromCard(page, cardIndex, fieldName, url, attribute = 'text') {
        const selectors = this.searchSelectors[fieldName] || [];
        
        for (const selector of selectors) {
            try {
                const result = await page.evaluate((sel, index, attr) => {
                    const cards = document.querySelectorAll('[data-testid="property-card"], .property-card, .list-card, .search-result, article[data-zpid]');
                    if (!cards[index]) return null;
                    
                    const element = cards[index].querySelector(sel.replace('[data-testid="property-card"] ', '').replace('.property-card ', '').replace('.list-card ', ''));
                    if (!element) return null;
                    
                    if (attr === 'text') {
                        return element.textContent?.trim();
                    } else if (attr === 'href') {
                        return element.href || element.getAttribute('href');
                    } else if (attr === 'src') {
                        return element.src || element.getAttribute('src');
                    } else {
                        return element.getAttribute(attr);
                    }
                }, selector, cardIndex, attribute);

                if (result) {
                    return result;
                }
            } catch (error) {
                continue;
            }
        }

        return null;
    }

    /**
     * Find elements using hierarchical selectors
     */
    async findElements(page, fieldName, url, pageType = 'detail') {
        const selectors = pageType === 'search' ? 
            this.searchSelectors[fieldName] : 
            this.detailSelectors[fieldName];

        if (!selectors) return [];

        const cacheKey = `${pageType}-${fieldName}-${this.getUrlPattern(url)}`;
        
        // Try cached selector first
        if (this.selectorCache.has(cacheKey)) {
            const cachedSelector = this.selectorCache.get(cacheKey);
            try {
                const elements = await page.$$(cachedSelector);
                if (elements && elements.length > 0) {
                    this.performanceStats.cacheHits++;
                    return elements;
                }
            } catch (error) {
                this.selectorCache.delete(cacheKey);
            }
        }

        // Try hierarchical selectors
        for (const selector of selectors) {
            try {
                const elements = await page.$$(selector);
                if (elements && elements.length > 0) {
                    this.selectorCache.set(cacheKey, selector);
                    this.performanceStats.cacheMisses++;
                    return elements;
                }
            } catch (error) {
                continue;
            }
        }

        return [];
    }

    /**
     * Extract property images
     */
    async extractImages(page, url) {
        try {
            const imageSelectors = this.detailSelectors.images;
            
            for (const selector of imageSelectors) {
                try {
                    const images = await page.$$eval(selector, imgs => 
                        imgs.map(img => img.src || img.getAttribute('src'))
                            .filter(src => src && src.startsWith('http'))
                    );
                    
                    if (images.length > 0) {
                        return images.slice(0, 20); // Limit to 20 images
                    }
                } catch (error) {
                    continue;
                }
            }
        } catch (error) {
            console.warn(`Failed to extract images: ${error.message}`);
        }

        return [];
    }

    /**
     * Extract additional contact information
     */
    async extractAdditionalContacts(page) {
        const contacts = {};
        
        try {
            const additionalContacts = await page.evaluate(() => {
                const result = {};
                
                // Look for email addresses
                const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
                const bodyText = document.body.textContent;
                const emails = bodyText.match(emailRegex);
                if (emails && emails.length > 0) {
                    result.contactEmails = [...new Set(emails)]; // Remove duplicates
                }

                // Look for additional phone numbers
                const phoneRegex = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
                const phones = bodyText.match(phoneRegex);
                if (phones && phones.length > 0) {
                    result.contactPhones = [...new Set(phones)];
                }

                return result;
            });

            Object.assign(contacts, additionalContacts);
        } catch (error) {
            console.warn('Failed to extract additional contact info:', error.message);
        }

        return contacts;
    }

    /**
     * Check if there's a next page in search results
     */
    async hasNextPage(page, url) {
        try {
            const nextButtons = await this.findElements(page, 'nextPageButton', url, 'search');
            return nextButtons && nextButtons.length > 0;
        } catch (error) {
            return false;
        }
    }

    /**
     * Utility methods
     */
    normalizeUrl(url) {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        if (url.startsWith('/')) return `https://www.zillow.com${url}`;
        return `https://www.zillow.com/${url}`;
    }

    extractZpidFromUrl(url) {
        if (!url) return null;
        const match = url.match(/\/(\d+)_zpid/);
        return match ? match[1] : null;
    }

    cleanPrice(priceStr) {
        if (!priceStr) return null;
        const cleaned = priceStr.replace(/[^\d,.-]/g, '');
        const number = parseFloat(cleaned.replace(/,/g, ''));
        return isNaN(number) ? priceStr : number;
    }

    parsePropertyDetails(detailsStr) {
        const details = {};
        if (!detailsStr) return details;

        // Extract beds
        const bedMatch = detailsStr.match(/(\d+)\s*(?:bd|bed|bedroom)/i);
        if (bedMatch) details.beds = parseInt(bedMatch[1]);

        // Extract baths
        const bathMatch = detailsStr.match(/(\d+(?:\.\d+)?)\s*(?:ba|bath|bathroom)/i);
        if (bathMatch) details.baths = parseFloat(bathMatch[1]);

        // Extract square footage
        const sqftMatch = detailsStr.match(/([\d,]+)\s*(?:sqft|sq ft|square feet)/i);
        if (sqftMatch) details.sqft = parseInt(sqftMatch[1].replace(/,/g, ''));

        return details;
    }

    getUrlPattern(url) {
        // Extract a pattern from URL for caching (remove specific IDs)
        return url.replace(/\/\d+_zpid/, '/ZPID').replace(/\d{5,}/, 'ID');
    }

    /**
     * Get performance statistics
     */
    getStats() {
        const cacheHitRate = this.performanceStats.cacheHits + this.performanceStats.cacheMisses > 0 ?
            this.performanceStats.cacheHits / (this.performanceStats.cacheHits + this.performanceStats.cacheMisses) : 0;

        return {
            cachedSelectors: this.selectorCache.size,
            cacheHitRate: cacheHitRate,
            aiCalls: this.performanceStats.aiCalls,
            successfulExtractions: this.performanceStats.successfulExtractions,
            failedExtractions: this.performanceStats.failedExtractions,
            totalExtractions: this.performanceStats.successfulExtractions + this.performanceStats.failedExtractions,
            successRate: this.performanceStats.successfulExtractions + this.performanceStats.failedExtractions > 0 ?
                this.performanceStats.successfulExtractions / (this.performanceStats.successfulExtractions + this.performanceStats.failedExtractions) : 0
        };
    }

    /**
     * Reset cache and statistics
     */
    reset() {
        this.selectorCache.clear();
        this.failureCount.clear();
        this.performanceStats = {
            cacheHits: 0,
            cacheMisses: 0,
            aiCalls: 0,
            successfulExtractions: 0,
            failedExtractions: 0
        };
    }
}

