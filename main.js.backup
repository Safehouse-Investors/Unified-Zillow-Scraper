import { Actor } from 'apify';
import { PuppeteerCrawler, ProxyConfiguration } from 'crawlee';
import { UnifiedSelectorManager } from './unified-selector-manager.js';
import { URLGenerator } from './url-generator.js';

// Initialize the Apify Actor
await Actor.init();

// Get the actor's input
const input = await Actor.getInput();
const {
    mode = 'comprehensive',
    startUrls = [],
    zipCodes = [],
    searchFilters = {},
    keywords = [],
    keywordFilterMode = 'any',
    enableAI = true,
    maxProperties = 100,
    maxPages = 10,
    maxItems = null,
    proxyConfiguration,
    includeImages = true,
    includeContactInfo = true,
    testMode = false,
    discoveryMode = 'enhanced'
} = input;

// Validate input based on mode
if (mode === 'search' || mode === 'details') {
    if (!startUrls || !Array.isArray(startUrls) || startUrls.length === 0) {
        throw new Error(`Input error: 'startUrls' must be a non-empty array for ${mode} mode.`);
    }
}

if (mode === 'zipcode' || mode === 'comprehensive') {
    if (!zipCodes || !Array.isArray(zipCodes) || zipCodes.length === 0) {
        throw new Error(`Input error: 'zipCodes' must be a non-empty array for ${mode} mode.`);
    }
}

// Fixer-upper keywords for property filtering
const fixerUpperKeywords = [
    'fixer-upper', 'needs TLC', 'handyman special', 'as-is', 'investor special',
    'needs work', 'needs repairs', 'tear down', 'cash only', 'motivated seller',
    'needs updating', 'needs renovation', 'needs remodeling', 'needs improvement',
    'bring your contractor', 'great potential', 'diamond in the rough',
    'unfinished', 'uninhabitable', 'project house', 'needs love', 'needs restoration',
    'sold as-is', 'rehab opportunity', 'needs complete rehab', 'fixer', 'distressed',
    'needs attention', 'not move-in ready', 'outdated', 'needs new roof',
    'needs foundation repair', 'water damage', 'fire damage', 'mold', 'repairs needed',
    'priced to sell', 'bargain', 'must sell', 'below market', 'value add',
    'opportunity knocks', 'make an offer', ...keywords
].map(k => k.toLowerCase());

const proxy = await Actor.createProxyConfiguration(proxyConfiguration);
const requestQueue = await Actor.openRequestQueue();
const selectorManager = new UnifiedSelectorManager();
const urlGenerator = new URLGenerator();

// Statistics tracking
let totalProperties = 0;
let totalPages = 0;
let successfulExtractions = 0;
let failedExtractions = 0;
let itemsCounter = 0;
const zipCodeStats = new Map();
const modeStats = {
    searchPages: 0,
    detailPages: 0,
    zipcodePages: 0,
    keywordMatches: 0,
    keywordFiltered: 0
};

console.log(`🚀 Starting Unified Zillow Scraper in ${mode.toUpperCase()} mode...`);

// Initialize request queue based on mode
if (mode === 'search') {
    // Search mode: Process Zillow search result URLs
    console.log(`📊 Search Mode: Processing ${startUrls.length} search URLs`);
    for (const req of startUrls) {
        const url = typeof req === 'string' ? req : req.url;
        if (!url.includes('zillow.com')) {
            console.warn(`URL does not appear to be a Zillow URL, skipping: ${url}`);
            continue;
        }
        await requestQueue.addRequest({
            url,
            userData: {
                label: 'SEARCH_PAGE',
                mode: 'search',
                source: 'user_provided'
            }
        });
    }
} else if (mode === 'details') {
    // Details mode: Process specific property detail URLs
    console.log(`🏠 Details Mode: Processing ${startUrls.length} property URLs`);
    for (const req of startUrls) {
        const url = typeof req === 'string' ? req : req.url;
        if (!url.includes('zillow.com/homedetails/')) {
            console.warn(`URL does not appear to be a Zillow detail page, skipping: ${url}`);
            continue;
        }
        await requestQueue.addRequest({
            url,
            userData: {
                label: 'DETAIL',
                mode: 'details',
                source: 'user_provided'
            }
        });
    }
} else if (mode === 'zipcode') {
    // Zipcode mode: Search by zip codes
    console.log(`📍 Zipcode Mode: Processing ${zipCodes.length} zip codes with ${discoveryMode} discovery`);
    for (const zipCode of zipCodes) {
        if (!urlGenerator.isValidZipCode(zipCode)) {
            console.warn(`Invalid zip code format: ${zipCode}, skipping...`);
            continue;
        }

        const searchUrls = generateSearchUrls(zipCode, searchFilters, discoveryMode);
        
        for (const searchUrl of searchUrls) {
            await requestQueue.addRequest({
                url: searchUrl.url,
                userData: {
                    label: 'ZIPCODE_SEARCH',
                    zipCode: zipCode,
                    page: 1,
                    searchType: searchUrl.label,
                    mode: 'zipcode'
                }
            });
        }
        
        zipCodeStats.set(zipCode, {
            properties: 0,
            pages: 0,
            errors: 0,
            searchTypes: searchUrls.map(u => u.label)
        });
    }
} else if (mode === 'comprehensive') {
    // Comprehensive mode: Combine zipcode search with detail extraction
    console.log(`🎯 Comprehensive Mode: Processing ${zipCodes.length} zip codes + ${startUrls.length} URLs`);
    
    // Add zipcode searches
    for (const zipCode of zipCodes) {
        if (!urlGenerator.isValidZipCode(zipCode)) {
            console.warn(`Invalid zip code format: ${zipCode}, skipping...`);
            continue;
        }

        const searchUrls = generateSearchUrls(zipCode, searchFilters, discoveryMode);
        
        for (const searchUrl of searchUrls) {
            await requestQueue.addRequest({
                url: searchUrl.url,
                userData: {
                    label: 'COMPREHENSIVE_SEARCH',
                    zipCode: zipCode,
                    page: 1,
                    searchType: searchUrl.label,
                    mode: 'comprehensive'
                }
            });
        }
        
        zipCodeStats.set(zipCode, {
            properties: 0,
            pages: 0,
            errors: 0,
            searchTypes: searchUrls.map(u => u.label)
        });
    }
    
    // Add direct URLs
    for (const req of startUrls) {
        const url = typeof req === 'string' ? req : req.url;
        if (!url.includes('zillow.com')) {
            console.warn(`URL does not appear to be a Zillow URL, skipping: ${url}`);
            continue;
        }
        
        if (url.includes('/homedetails/')) {
            await requestQueue.addRequest({
                url,
                userData: {
                    label: 'DETAIL',
                    mode: 'comprehensive',
                    source: 'user_provided'
                }
            });
        } else {
            await requestQueue.addRequest({
                url,
                userData: {
                    label: 'SEARCH_PAGE',
                    mode: 'comprehensive',
                    source: 'user_provided'
                }
            });
        }
    }
}

// Create and configure the PuppeteerCrawler
const crawler = new PuppeteerCrawler({
    requestQueue,
    proxyConfiguration: proxy,
    launchContext: {
        useChrome: true,
        stealth: true,
    },
    minConcurrency: 1,
    maxConcurrency: mode === 'details' ? 5 : 3,
    maxRequestRetries: 3,

    requestHandler: async ({ page, request, log }) => {
        const { label, zipCode, page: pageNum, searchType, mode: requestMode, source } = request.userData;

        // Handle different request types
        if (label === 'SEARCH_PAGE') {
            await handleSearchPage(page, request, log);
        } else if (label === 'ZIPCODE_SEARCH' || label === 'COMPREHENSIVE_SEARCH') {
            await handleZipcodeSearch(page, request, log);
        } else if (label === 'DETAIL') {
            await handleDetailPage(page, request, log);
        }

        // Check if the maxItems limit has been reached
        if (maxItems && itemsCounter >= maxItems) {
            log.info(`Reached maxItems limit of ${maxItems}. Stopping crawl.`);
            await crawler.autoscaledPool.abort();
        }
    },

    failedRequestHandler: async ({ request, log }) => {
        log.error(`Request ${request.url} failed after multiple retries.`);
        failedExtractions++;
        
        if (request.userData.zipCode) {
            const stats = zipCodeStats.get(request.userData.zipCode);
            if (stats) stats.errors++;
        }
    },
});

/**
 * Handle search result pages (from user-provided search URLs)
 */
async function handleSearchPage(page, request, log) {
    const { mode: requestMode, source } = request.userData;
    
    log.info(`Processing search page: ${request.url}`);
    modeStats.searchPages++;

    try {
        // Check for blocking or errors
        const isBlocked = await checkForBlocking(page);
        if (isBlocked) {
            throw new Error(`Blocked or no results: ${request.url}`);
        }

        await page.waitForTimeout(3000);

        // Extract property listings from search page
        const properties = await selectorManager.extractSearchResults(page, request.url);
        
        log.info(`Found ${properties.length} properties on search page`);

        // Process each property
        for (const property of properties) {
            try {
                property.searchUrl = request.url;
                property.source = source || 'search_page';

                // In comprehensive mode, add detail extraction to queue
                if (requestMode === 'comprehensive' && property.url) {
                    await requestQueue.addRequest({
                        url: property.url,
                        userData: {
                            label: 'DETAIL',
                            searchData: property,
                            mode: 'comprehensive',
                            source: 'discovered'
                        }
                    });
                } else {
                    // In search mode, save basic property data
                    await Actor.pushData(property);
                    successfulExtractions++;
                }

                totalProperties++;

            } catch (error) {
                log.warn(`Failed to process property: ${error.message}`);
                failedExtractions++;
            }
        }

        totalPages++;

    } catch (error) {
        log.error(`Failed to process search page: ${error.message}`);
        failedExtractions++;
    }
}

/**
 * Handle zipcode search pages
 */
async function handleZipcodeSearch(page, request, log) {
    const { zipCode, page: pageNum, searchType, mode: requestMode } = request.userData;
    
    log.info(`Processing zipcode search for ${zipCode}, page ${pageNum}, type ${searchType}: ${request.url}`);
    modeStats.zipcodePages++;

    try {
        const isBlocked = await checkForBlocking(page);
        if (isBlocked) {
            throw new Error(`Blocked or no results for zip code ${zipCode}: ${request.url}`);
        }

        await page.waitForTimeout(3000);

        const properties = await selectorManager.extractSearchResults(page, request.url);
        
        log.info(`Found ${properties.length} properties on page ${pageNum} for zip code ${zipCode}`);

        // Process each property
        for (const property of properties) {
            try {
                property.searchZipCode = zipCode;
                property.searchPage = pageNum;
                property.searchType = searchType;
                property.searchUrl = request.url;

                // In comprehensive mode, add detail extraction to queue
                if (requestMode === 'comprehensive' && property.url) {
                    await requestQueue.addRequest({
                        url: property.url,
                        userData: {
                            label: 'DETAIL',
                            zipCode: zipCode,
                            searchData: property,
                            mode: 'comprehensive',
                            source: 'zipcode_search'
                        }
                    });
                } else {
                    // In zipcode mode, save basic property data
                    await Actor.pushData(property);
                    successfulExtractions++;
                }

                totalProperties++;
                const stats = zipCodeStats.get(zipCode);
                if (stats) stats.properties++;

            } catch (error) {
                log.warn(`Failed to process property: ${error.message}`);
                failedExtractions++;
            }
        }

        totalPages++;
        const stats = zipCodeStats.get(zipCode);
        if (stats) stats.pages++;

        // Check if we should continue to next page
        const shouldContinue = 
            stats && stats.pages < maxPages && 
            stats.properties < maxProperties &&
            properties.length > 0;

        if (shouldContinue) {
            const hasNext = await selectorManager.hasNextPage(page, request.url);
            
            if (hasNext) {
                const nextPageUrl = urlGenerator.generateSearchUrl(zipCode, searchFilters, pageNum + 1);
                await requestQueue.addRequest({
                    url: nextPageUrl,
                    userData: {
                        label: requestMode === 'comprehensive' ? 'COMPREHENSIVE_SEARCH' : 'ZIPCODE_SEARCH',
                        zipCode: zipCode,
                        page: pageNum + 1,
                        searchType: searchType,
                        mode: requestMode
                    }
                });
                log.info(`Added page ${pageNum + 1} for zip code ${zipCode}`);
            }
        }

    } catch (error) {
        log.error(`Failed to process zipcode search for ${zipCode}: ${error.message}`);
        const stats = zipCodeStats.get(zipCode);
        if (stats) stats.errors++;
        failedExtractions++;
    }
}

/**
 * Handle property detail pages
 */
async function handleDetailPage(page, request, log) {
    const { zipCode, searchData, mode: requestMode, source } = request.userData;
    
    log.info(`Processing property details: ${request.url}`);
    modeStats.detailPages++;

    try {
        const isBlocked = await checkForBlocking(page);
        if (isBlocked) {
            throw new Error(`Blocked by anti-bot measures on URL: ${request.url}`);
        }

        await page.waitForTimeout(2000);
        
        // Extract detailed property data
        const propertyData = await selectorManager.extractPropertyDetails(page, request.url);

        // Merge with search data if available
        const combinedData = searchData ? 
            { ...searchData, ...propertyData } : 
            propertyData;

        // Enhanced data processing
        const processedData = await processPropertyData(combinedData, page);

        // Keyword filtering for fixer-upper properties
        const description = (processedData.description || '').toLowerCase();
        const matchedKeywords = fixerUpperKeywords.filter(keyword => 
            description.includes(keyword)
        );

        // Apply keyword filtering based on mode
        let shouldSave = false;
        if (keywordFilterMode === 'none') {
            shouldSave = true;
        } else if (keywordFilterMode === 'any') {
            shouldSave = fixerUpperKeywords.length === 0 || matchedKeywords.length > 0;
        } else if (keywordFilterMode === 'all') {
            shouldSave = fixerUpperKeywords.length === 0 || matchedKeywords.length === fixerUpperKeywords.length;
        }

        if (shouldSave) {
            const result = {
                ...processedData,
                url: request.url,
                scrapedAt: new Date().toISOString(),
                isFixerUpper: matchedKeywords.length > 0,
                matchedKeywords: matchedKeywords,
                extractionMethod: 'unified-selector-manager',
                mode: requestMode,
                source: source || 'unknown',
                selectorStats: enableAI ? selectorManager.getStats() : null
            };

            await Actor.pushData(result);
            successfulExtractions++;
            modeStats.keywordMatches++;
            log.info(`Successfully scraped: ${result.address || 'Unknown address'}`);
        } else {
            modeStats.keywordFiltered++;
            log.info(`Property filtered out - no matching keywords: ${request.url}`);
        }

        itemsCounter++;

    } catch (error) {
        failedExtractions++;
        log.error(`Failed to scrape ${request.url}: ${error.message}`);
        
        if (testMode) {
            await Actor.pushData({
                url: request.url,
                error: error.message,
                scrapedAt: new Date().toISOString(),
                success: false,
                mode: requestMode
            });
        }
    }
}

/**
 * Check for blocking or access issues
 */
async function checkForBlocking(page) {
    return await page.evaluate(() => 
        document.title.includes('Are you a human?') || 
        document.body.textContent.includes('blocked') ||
        document.body.textContent.includes('Access Denied') ||
        document.body.textContent.includes('No results found')
    );
}

/**
 * Generate search URLs based on discovery mode
 */
function generateSearchUrls(zipCode, filters, discoveryMode) {
    const urls = [];
    
    // Always include primary search
    urls.push({
        url: urlGenerator.generateSearchUrl(zipCode, filters),
        label: 'primary',
        description: 'Primary search with user filters'
    });

    if (discoveryMode === 'enhanced' || discoveryMode === 'comprehensive') {
        const discoveryUrls = urlGenerator.generateDiscoveryUrls(zipCode, {
            includePriceSearches: true,
            includeTimeSearches: true,
            includeTypeSearches: false,
            includeDistressedSearches: discoveryMode === 'comprehensive'
        });
        
        urls.push(...discoveryUrls.slice(0, discoveryMode === 'comprehensive' ? 10 : 5));
    }

    return urls;
}

/**
 * Process and enhance extracted property data
 */
async function processPropertyData(data, page) {
    const processed = { ...data };

    // Enhanced price processing
    if (processed.price) {
        processed.price = cleanPrice(processed.price);
    }

    // Enhanced bed/bath processing
    if (processed.beds) {
        processed.beds = extractNumber(processed.beds);
    }
    if (processed.baths) {
        processed.baths = extractNumber(processed.baths);
    }

    // Enhanced square footage processing
    if (processed.sqft) {
        processed.sqft = extractNumber(processed.sqft.replace(/,/g, ''));
    }

    // Enhanced image processing
    if (includeImages && processed.images && Array.isArray(processed.images)) {
        processed.images = processed.images
            .filter(img => img && img.startsWith('http'))
            .slice(0, 20);
        processed.imageCount = processed.images.length;
    } else if (!includeImages) {
        delete processed.images;
    }

    // Contact information processing
    if (!includeContactInfo) {
        delete processed.agentName;
        delete processed.agentPhone;
        delete processed.contactEmails;
        delete processed.contactPhones;
    }

    return processed;
}

/**
 * Clean and standardize price strings
 */
function cleanPrice(priceStr) {
    if (!priceStr) return null;
    
    const cleaned = priceStr.replace(/[^\d,.-]/g, '');
    const number = parseFloat(cleaned.replace(/,/g, ''));
    
    return isNaN(number) ? priceStr : number;
}

/**
 * Extract numeric values from strings
 */
function extractNumber(str) {
    if (!str) return null;
    
    const match = str.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : null;
}

// Run the crawler
await crawler.run();

// Log final statistics
console.log(`\n🎉 === Unified Zillow Scraper Complete ===`);
console.log(`Mode: ${mode.toUpperCase()}`);
console.log(`Total properties found: ${totalProperties}`);
console.log(`Total pages processed: ${totalPages}`);
console.log(`Successful extractions: ${successfulExtractions}`);
console.log(`Failed extractions: ${failedExtractions}`);
console.log(`Success rate: ${totalProperties > 0 ? ((successfulExtractions / totalProperties) * 100).toFixed(2) : 0}%`);

console.log(`\n📊 === Mode Statistics ===`);
console.log(`Search pages processed: ${modeStats.searchPages}`);
console.log(`Zipcode pages processed: ${modeStats.zipcodePages}`);
console.log(`Detail pages processed: ${modeStats.detailPages}`);
console.log(`Properties matching keywords: ${modeStats.keywordMatches}`);
console.log(`Properties filtered by keywords: ${modeStats.keywordFiltered}`);

if (zipCodeStats.size > 0) {
    console.log(`\n📍 === Zip Code Breakdown ===`);
    for (const [zipCode, stats] of zipCodeStats.entries()) {
        console.log(`${zipCode}: ${stats.properties} properties, ${stats.pages} pages, ${stats.errors} errors, search types: ${stats.searchTypes.join(', ')}`);
    }
}

if (enableAI) {
    console.log(`\n🤖 === AI Selector Manager Stats ===`);
    console.log(JSON.stringify(selectorManager.getStats(), null, 2));
}

console.log(`\n✅ Scraping completed successfully!`);

// Exit the actor
await Actor.exit();

