/**
 * URL Generator for Enhanced Property Discovery
 * Generates optimized search URLs for finding properties with specific characteristics
 */

export class URLGenerator {
    constructor() {
        this.baseUrl = 'https://www.zillow.com/homes/for_sale';
        
        // Property type mappings
        this.propertyTypes = {
            'all': {},
            'houses': { houses: { value: true } },
            'condos': { condo: { value: true } },
            'townhomes': { townhouse: { value: true } },
            'multi-family': { multiFamily: { value: true } },
            'lots': { land: { value: true } },
            'manufactured': { manufactured: { value: true } }
        };
        
        // Days on market mappings
        this.daysOnMarketMap = {
            'any': null,
            '1': '1',
            '7': '7',
            '14': '14',
            '30': '30',
            '90': '90',
            '180': '180'
        };
        
        // Price reduction filters for finding motivated sellers
        this.priceReductionFilters = {
            'any': null,
            'recent': '30',
            'multiple': '60'
        };
    }

    /**
     * Generate search URL for a specific zip code with filters
     */
    generateSearchUrl(zipCode, filters = {}, page = 1) {
        const searchState = {
            pagination: { currentPage: page },
            usersSearchTerm: zipCode,
            mapBounds: {},
            regionSelection: [{ regionId: zipCode, regionType: 7 }],
            isMapVisible: false,
            filterState: this.buildFilterState(filters),
            isListVisible: true
        };

        const params = new URLSearchParams();
        params.append('searchQueryState', JSON.stringify(searchState));

        return `${this.baseUrl}/?${params.toString()}`;
    }

    /**
     * Generate multiple search URLs for comprehensive property discovery
     */
    generateDiscoveryUrls(zipCode, options = {}) {
        const urls = [];
        
        // Base search without filters
        urls.push({
            url: this.generateSearchUrl(zipCode),
            label: 'all_properties',
            description: 'All properties in zip code'
        });

        // Price-focused searches for finding deals
        if (options.includePriceSearches !== false) {
            urls.push(...this.generatePriceBasedUrls(zipCode));
        }

        // Time-based searches for finding motivated sellers
        if (options.includeTimeSearches !== false) {
            urls.push(...this.generateTimeBasedUrls(zipCode));
        }

        // Property type specific searches
        if (options.includeTypeSearches !== false) {
            urls.push(...this.generateTypeBasedUrls(zipCode));
        }

        // Distressed property searches
        if (options.includeDistressedSearches !== false) {
            urls.push(...this.generateDistressedPropertyUrls(zipCode));
        }

        return urls;
    }

    /**
     * Generate price-based search URLs for finding deals
     */
    generatePriceBasedUrls(zipCode) {
        const urls = [];
        
        // Below market searches (various price ranges)
        const priceRanges = [
            { max: 100000, label: 'under_100k' },
            { max: 200000, label: 'under_200k' },
            { max: 300000, label: 'under_300k' },
            { min: 50000, max: 150000, label: 'mid_range_deals' }
        ];

        for (const range of priceRanges) {
            const filters = { price: {} };
            if (range.min) filters.price.min = range.min;
            if (range.max) filters.price.max = range.max;

            urls.push({
                url: this.generateSearchUrl(zipCode, filters),
                label: range.label,
                description: `Properties ${range.min ? `$${range.min.toLocaleString()}-` : ''}$${range.max.toLocaleString()}`
            });
        }

        return urls;
    }

    /**
     * Generate time-based search URLs for finding motivated sellers
     */
    generateTimeBasedUrls(zipCode) {
        const urls = [];
        
        // Long time on market (potential motivated sellers)
        const timeRanges = [
            { days: '90', label: 'long_market_90' },
            { days: '180', label: 'long_market_180' },
            { days: '365', label: 'long_market_365' }
        ];

        for (const timeRange of timeRanges) {
            const filters = { daysOnZillow: { value: timeRange.days } };
            
            urls.push({
                url: this.generateSearchUrl(zipCode, filters),
                label: timeRange.label,
                description: `Properties on market ${timeRange.days}+ days`
            });
        }

        // Recently listed (new opportunities)
        urls.push({
            url: this.generateSearchUrl(zipCode, { daysOnZillow: { value: '7' } }),
            label: 'recently_listed',
            description: 'Properties listed in last 7 days'
        });

        return urls;
    }

    /**
     * Generate property type specific search URLs
     */
    generateTypeBasedUrls(zipCode) {
        const urls = [];
        
        // Focus on property types that often need work
        const targetTypes = ['houses', 'multi-family', 'manufactured'];
        
        for (const type of targetTypes) {
            const filters = this.propertyTypes[type];
            
            urls.push({
                url: this.generateSearchUrl(zipCode, filters),
                label: `${type}_only`,
                description: `${type.charAt(0).toUpperCase() + type.slice(1)} only`
            });
        }

        return urls;
    }

    /**
     * Generate URLs specifically for finding distressed properties
     */
    generateDistressedPropertyUrls(zipCode) {
        const urls = [];
        
        // Auction properties
        urls.push({
            url: this.generateSearchUrl(zipCode, { isAuction: { value: true } }),
            label: 'auction_properties',
            description: 'Auction properties'
        });

        // Foreclosure properties
        urls.push({
            url: this.generateSearchUrl(zipCode, { isForeclosureAuction: { value: true } }),
            label: 'foreclosure_properties',
            description: 'Foreclosure properties'
        });

        // Pre-foreclosure properties
        urls.push({
            url: this.generateSearchUrl(zipCode, { isPreForeclosureAuction: { value: true } }),
            label: 'pre_foreclosure_properties',
            description: 'Pre-foreclosure properties'
        });

        // Bank owned properties
        urls.push({
            url: this.generateSearchUrl(zipCode, { isBankOwned: { value: true } }),
            label: 'bank_owned_properties',
            description: 'Bank owned properties'
        });

        return urls;
    }

    /**
     * Generate URLs for finding properties with specific characteristics
     */
    generateCharacteristicUrls(zipCode, characteristics = {}) {
        const urls = [];
        
        // Older properties (more likely to need work)
        if (characteristics.includeOlder) {
            urls.push({
                url: this.generateSearchUrl(zipCode, { 
                    built: { max: 1980 } 
                }),
                label: 'older_properties',
                description: 'Properties built before 1980'
            });
        }

        // Larger properties (more potential)
        if (characteristics.includeLarger) {
            urls.push({
                url: this.generateSearchUrl(zipCode, { 
                    sqft: { min: 2000 } 
                }),
                label: 'larger_properties',
                description: 'Properties over 2000 sqft'
            });
        }

        // Properties with land
        if (characteristics.includeLand) {
            urls.push({
                url: this.generateSearchUrl(zipCode, { 
                    lotSize: { min: 0.25 } 
                }),
                label: 'properties_with_land',
                description: 'Properties with 0.25+ acres'
            });
        }

        return urls;
    }

    /**
     * Build filter state object for Zillow search
     */
    buildFilterState(filters) {
        const filterState = {};

        // Price filters
        if (filters.price) {
            filterState.price = {};
            if (filters.price.min) filterState.price.min = filters.price.min;
            if (filters.price.max) filterState.price.max = filters.price.max;
        }

        // Property type filters
        if (filters.propertyType && filters.propertyType !== 'all') {
            Object.assign(filterState, this.propertyTypes[filters.propertyType] || {});
        }

        // Days on market filter
        if (filters.daysOnMarket && filters.daysOnMarket !== 'any') {
            filterState.daysOnZillow = { value: this.daysOnMarketMap[filters.daysOnMarket] };
        }

        // Specific Zillow filters
        if (filters.daysOnZillow) {
            filterState.daysOnZillow = filters.daysOnZillow;
        }

        // Auction filters
        if (filters.isAuction) {
            filterState.isAuction = filters.isAuction;
        }

        if (filters.isForeclosureAuction) {
            filterState.isForeclosureAuction = filters.isForeclosureAuction;
        }

        if (filters.isPreForeclosureAuction) {
            filterState.isPreForeclosureAuction = filters.isPreForeclosureAuction;
        }

        if (filters.isBankOwned) {
            filterState.isBankOwned = filters.isBankOwned;
        }

        // Year built filter
        if (filters.built) {
            filterState.built = filters.built;
        }

        // Square footage filter
        if (filters.sqft) {
            filterState.sqft = filters.sqft;
        }

        // Lot size filter
        if (filters.lotSize) {
            filterState.lotSize = filters.lotSize;
        }

        // Bedrooms filter
        if (filters.beds) {
            filterState.beds = filters.beds;
        }

        // Bathrooms filter
        if (filters.baths) {
            filterState.baths = filters.baths;
        }

        return filterState;
    }

    /**
     * Generate URLs for comprehensive market analysis
     */
    generateMarketAnalysisUrls(zipCode) {
        const urls = [];
        
        // Price segments
        const priceSegments = [
            { max: 100000, label: 'budget_segment' },
            { min: 100000, max: 300000, label: 'mid_segment' },
            { min: 300000, max: 500000, label: 'upper_mid_segment' },
            { min: 500000, label: 'luxury_segment' }
        ];

        for (const segment of priceSegments) {
            const filters = { price: {} };
            if (segment.min) filters.price.min = segment.min;
            if (segment.max) filters.price.max = segment.max;

            urls.push({
                url: this.generateSearchUrl(zipCode, filters),
                label: segment.label,
                description: `Market analysis: ${segment.label.replace('_', ' ')}`
            });
        }

        return urls;
    }

    /**
     * Validate zip code format
     */
    isValidZipCode(zipCode) {
        // US zip code validation (5 digits or 5+4 format)
        const zipRegex = /^\d{5}(-\d{4})?$/;
        return zipRegex.test(zipCode);
    }

    /**
     * Get search URL with custom query state
     */
    generateCustomUrl(customState) {
        const params = new URLSearchParams();
        params.append('searchQueryState', JSON.stringify(customState));
        return `${this.baseUrl}/?${params.toString()}`;
    }
}

