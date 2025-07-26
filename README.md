# Unified Zillow Scraper - The Ultimate All-in-One Solution

A revolutionary unified Apify actor that combines the functionality of three separate Zillow scrapers into one powerful, intelligent system. This comprehensive solution provides search functionality, zipcode discovery, detailed property extraction, and AI-powered automatic selector updates with built-in fixer-upper keyword filtering - all in a single, easy-to-use actor.

## 🚀 Revolutionary Four-Mode Architecture

### **🔍 Search Mode**
Process Zillow search result URLs directly. Perfect for scraping specific search queries or market segments.

**Use Case**: You have specific Zillow search URLs and want to extract property listings from those pages.

**Input**: Zillow search URLs (e.g., `https://www.zillow.com/homes/for_sale/90210/`)

**Output**: Basic property data from search result listings

### **📍 Zipcode Mode** 
Intelligent property discovery by zip code with multiple search strategies and comprehensive market coverage.

**Use Case**: You want to discover all available properties in specific zip codes using advanced search strategies.

**Input**: Zip codes (e.g., `["90210", "10001", "33101"]`)

**Output**: Properties discovered through intelligent search strategies

### **🏠 Details Mode**
Deep extraction from specific property detail pages with comprehensive data collection.

**Use Case**: You have specific property URLs and want detailed information including descriptions, agent contacts, and images.

**Input**: Property detail URLs (e.g., `https://www.zillow.com/homedetails/123-Main-St/123456_zpid/`)

**Output**: Comprehensive property details with all available information

### **🎯 Comprehensive Mode**
Complete end-to-end solution combining zipcode discovery with detailed extraction.

**Use Case**: You want the full pipeline - discover properties by zip code, then extract detailed information from each property.

**Input**: Zip codes + optional property URLs

**Output**: Complete property intelligence with full details

## 🤖 AI-Powered Self-Healing Technology

### **Unified Selector Management**
- **Single System**: Handles both search results and property detail pages
- **Hierarchical Selectors**: Multiple fallback strategies for maximum reliability
- **Intelligent Caching**: Performance-optimized selector storage and reuse
- **AI Generation**: GPT-4 powered selector creation when standard approaches fail

### **Automatic Adaptation**
- **Website Changes**: Automatically adapts when Zillow updates their structure
- **Performance Monitoring**: Tracks success rates and optimizes extraction strategies
- **Error Recovery**: Multi-layer error handling ensures continuous operation
- **Zero Maintenance**: Reduces manual updates and maintenance requirements

## 💎 Built-in Fixer-Upper Intelligence

### **45+ Keywords Included**
All the investment-focused keywords you specified are built into the system:

fixer-upper, needs TLC, handyman special, as-is, investor special, needs work, needs repairs, tear down, cash only, motivated seller, needs updating, needs renovation, needs remodeling, needs improvement, bring your contractor, great potential, diamond in the rough, unfinished, uninhabitable, project house, needs love, needs restoration, sold as-is, rehab opportunity, needs complete rehab, fixer, distressed, needs attention, not move-in ready, outdated, needs new roof, needs foundation repair, water damage, fire damage, mold, repairs needed, priced to sell, bargain, must sell, below market, value add, opportunity knocks, make an offer

### **Smart Filtering Options**
- **Any Mode**: Property matches if ANY keyword is found (default)
- **All Mode**: Property matches only if ALL keywords are found
- **None Mode**: No keyword filtering applied
- **Custom Keywords**: Add your own terms to the built-in list

## 📋 Complete Configuration Guide

### **Mode Selection**
```json
{
  "mode": "comprehensive"
}
```

**Available Modes**:
- `search` - Process Zillow search URLs
- `zipcode` - Search by zip codes
- `details` - Extract from property URLs
- `comprehensive` - Full pipeline (zipcode + details)

### **Search Mode Configuration**
```json
{
  "mode": "search",
  "startUrls": [
    {"url": "https://www.zillow.com/homes/for_sale/90210/"},
    {"url": "https://www.zillow.com/homes/for_sale/Beverly-Hills-CA/"}
  ],
  "maxItems": 100
}
```

### **Zipcode Mode Configuration**
```json
{
  "mode": "zipcode",
  "zipCodes": ["90210", "10001", "33101"],
  "searchFilters": {
    "minPrice": 100000,
    "maxPrice": 500000,
    "propertyType": "houses",
    "daysOnMarket": "30"
  },
  "discoveryMode": "enhanced",
  "maxProperties": 100,
  "maxPages": 10
}
```

### **Details Mode Configuration**
```json
{
  "mode": "details",
  "startUrls": [
    {"url": "https://www.zillow.com/homedetails/123-Main-St/123456_zpid/"},
    {"url": "https://www.zillow.com/homedetails/456-Oak-Ave/789012_zpid/"}
  ],
  "includeImages": true,
  "includeContactInfo": true
}
```

### **Comprehensive Mode Configuration**
```json
{
  "mode": "comprehensive",
  "zipCodes": ["90210", "33101"],
  "startUrls": [
    {"url": "https://www.zillow.com/homedetails/specific-property/123456_zpid/"}
  ],
  "searchFilters": {
    "maxPrice": 300000,
    "propertyType": "houses"
  },
  "keywordFilterMode": "any",
  "discoveryMode": "comprehensive",
  "includeImages": true,
  "includeContactInfo": true
}
```

### **Advanced Options**
```json
{
  "keywords": ["custom keyword", "another term"],
  "keywordFilterMode": "any",
  "enableAI": true,
  "testMode": false,
  "proxyConfiguration": {"useApifyProxy": true},
  "maxItems": 1000
}
```

## 🎯 Real-World Usage Examples

### **Investment Property Discovery**
```json
{
  "mode": "comprehensive",
  "zipCodes": ["33101", "75201", "30309"],
  "searchFilters": {
    "maxPrice": 300000,
    "propertyType": "houses",
    "daysOnMarket": "90"
  },
  "keywordFilterMode": "any",
  "discoveryMode": "comprehensive",
  "includeImages": true,
  "includeContactInfo": true,
  "maxProperties": 200
}
```

### **Market Research Analysis**
```json
{
  "mode": "zipcode",
  "zipCodes": ["90210", "10001", "33101"],
  "searchFilters": {
    "minPrice": 500000,
    "maxPrice": 2000000
  },
  "keywordFilterMode": "none",
  "discoveryMode": "enhanced",
  "maxProperties": 500,
  "maxPages": 20
}
```

### **Specific Property Analysis**
```json
{
  "mode": "details",
  "startUrls": [
    {"url": "https://www.zillow.com/homedetails/property1/123456_zpid/"},
    {"url": "https://www.zillow.com/homedetails/property2/789012_zpid/"}
  ],
  "includeImages": true,
  "includeContactInfo": true,
  "keywordFilterMode": "any"
}
```

### **Lead Generation for Agents**
```json
{
  "mode": "search",
  "startUrls": [
    {"url": "https://www.zillow.com/homes/for_sale/Miami-FL/"},
    {"url": "https://www.zillow.com/homes/for_sale/Dallas-TX/"}
  ],
  "includeContactInfo": true,
  "keywordFilterMode": "none",
  "maxItems": 300
}
```

## 📊 Comprehensive Output Format

### **Basic Property Data** (All Modes)
```json
{
  "url": "https://www.zillow.com/homedetails/...",
  "zpid": "123456789",
  "address": "123 Main St, Beverly Hills, CA 90210",
  "price": 1250000,
  "beds": 4,
  "baths": 3,
  "sqft": 2500,
  "extractedAt": "2025-07-26T00:30:00.000Z",
  "extractionMethod": "unified-selector-manager",
  "mode": "comprehensive",
  "source": "zipcode_search"
}
```

### **Search Context** (Zipcode/Comprehensive Modes)
```json
{
  "searchZipCode": "90210",
  "searchPage": 1,
  "searchType": "primary",
  "searchUrl": "https://www.zillow.com/homes/for_sale/..."
}
```

### **Detailed Information** (Details/Comprehensive Modes)
```json
{
  "fullAddress": "123 Main Street, Beverly Hills, CA 90210",
  "description": "Beautiful home in prime location with great potential...",
  "zestimate": 1300000,
  "propertyType": "Single Family",
  "yearBuilt": 1985,
  "lotSize": "0.25 acres",
  "agentName": "John Smith",
  "agentPhone": "(555) 123-4567",
  "contactEmails": ["agent@realty.com"],
  "contactPhones": ["(555) 123-4567"]
}
```

### **Investment Intelligence**
```json
{
  "isFixerUpper": true,
  "matchedKeywords": ["needs TLC", "great potential", "investor special"],
  "keywordFilterMode": "any"
}
```

### **Visual Assets** (When enabled)
```json
{
  "images": [
    "https://photos.zillowstatic.com/image1.jpg",
    "https://photos.zillowstatic.com/image2.jpg"
  ],
  "imageCount": 15
}
```

### **Performance Metadata** (When AI enabled)
```json
{
  "selectorStats": {
    "cachedSelectors": 25,
    "cacheHitRate": 0.85,
    "aiCalls": 3,
    "successfulExtractions": 147,
    "failedExtractions": 3,
    "successRate": 0.98
  }
}
```

## 🛠️ Setup and Deployment

### **1. GitHub Repository Setup**
Create a new repository and upload all files maintaining this structure:
```
your-unified-zillow-scraper/
├── .actor/
│   ├── apify.json
│   └── input_schema.json
├── src/
│   ├── main.js
│   ├── unified-selector-manager.js
│   ├── url-generator.js
│   └── test-unified.js
├── package.json
└── README.md
```

### **2. Apify Console Configuration**
1. **Create New Actor**: In Apify Console, create a new actor
2. **Connect Repository**: Link to your GitHub repository
3. **Environment Variables**: Set your OpenAI API key
   - `OPENAI_API_KEY`: Your OpenAI API key for AI-powered selector generation
   - `OPENAI_API_BASE`: OpenAI API base URL (usually pre-configured)

### **3. Build and Test**
1. **Build Actor**: Build the actor in Apify Console
2. **Test Run**: Start with a small test dataset
3. **Monitor Performance**: Check logs and adjust settings as needed

## 🧪 Comprehensive Testing

### **Built-in Test Suite**
Run the comprehensive test suite to validate all functionality:
```bash
npm run test
```

**Test Coverage Includes**:
- ✅ Core component initialization and functionality
- ✅ All four mode validations (search, zipcode, details, comprehensive)
- ✅ Input validation for URLs, zip codes, and parameters
- ✅ URL generation with filters and pagination
- ✅ Selector management with hierarchies and caching
- ✅ Keyword filtering across all modes and logic types
- ✅ Data processing including price cleaning and number extraction
- ✅ Error handling and graceful failure recovery
- ✅ Real browser integration (with test URLs)

### **Test Results Interpretation**
- **✅ PASS**: Feature working correctly
- **❌ FAIL**: Feature needs attention
- **⚠️ SKIP**: Test skipped (missing test data)

## 🔧 Advanced Architecture Deep Dive

### **Unified Request Handling System**

The actor employs a sophisticated request routing system that intelligently handles different types of requests based on the selected mode and URL patterns. This unified approach eliminates the complexity of managing multiple separate actors while maintaining the specialized functionality of each.

**Request Type Classification**:
The system automatically classifies incoming requests into four categories: `SEARCH_PAGE` for processing Zillow search result pages, `ZIPCODE_SEARCH` for zip code-based property discovery, `COMPREHENSIVE_SEARCH` for combined discovery and extraction workflows, and `DETAIL` for detailed property information extraction. This classification enables the system to apply the appropriate extraction strategies and data processing pipelines for each request type.

**Dynamic Queue Management**:
The request queue dynamically adapts based on the selected mode and discovery settings. In comprehensive mode, the system automatically queues discovered properties for detailed extraction, creating a seamless pipeline from discovery to complete data collection. The queue management system includes intelligent deduplication to prevent processing the same property multiple times and priority handling to ensure efficient resource utilization.

### **Intelligent Property Discovery Engine**

The discovery engine represents a significant advancement over traditional single-strategy search approaches. By employing multiple search strategies simultaneously, the system maximizes property coverage and identifies opportunities that might be missed by conventional methods.

**Multi-Strategy Search Implementation**:
The discovery engine generates multiple search URLs for each zip code, targeting different market segments and property characteristics. This includes price-based searches for finding below-market opportunities, time-based searches for identifying motivated sellers through properties with extended market time, and characteristic-based searches for specific property types that often present investment opportunities.

**Discovery Mode Optimization**:
The system offers three discovery modes that balance comprehensiveness with efficiency. Basic mode provides single-strategy searches suitable for simple property discovery tasks. Enhanced mode employs multiple complementary strategies for broader market coverage while maintaining reasonable resource usage. Comprehensive mode activates all available discovery strategies, including specialized searches for distressed properties and market analysis across all price segments.

### **AI-Powered Selector Evolution**

The unified selector management system represents a breakthrough in automated web scraping technology. By combining traditional hierarchical selector strategies with advanced AI-powered generation, the system achieves unprecedented reliability and adaptability.

**Hierarchical Selector Architecture**:
The system maintains comprehensive selector hierarchies for both search result pages and property detail pages. These hierarchies are ordered from most specific to most general, allowing the system to first attempt highly targeted selectors before falling back to broader approaches. This strategy maximizes extraction accuracy while maintaining robustness against minor website changes.

**AI Integration and Learning**:
When traditional selectors fail, the system automatically engages GPT-4 to analyze the current page structure and generate appropriate selectors. This AI integration goes beyond simple fallback functionality - the system learns from successful AI-generated selectors and incorporates them into future extraction strategies, creating a continuously improving extraction capability.

**Performance Optimization Through Caching**:
The intelligent caching system stores successful selectors with URL pattern recognition, enabling rapid reuse across similar page structures. The cache performance monitoring provides detailed analytics on hit rates and selector effectiveness, allowing for continuous optimization of extraction strategies.

## 📈 Performance and Scalability

### **Intelligent Concurrency Management**

The system employs sophisticated concurrency controls that adapt to the current operation mode and website response characteristics. This dynamic approach ensures optimal performance while respecting website resources and avoiding anti-bot measures.

**Mode-Specific Concurrency**:
Different modes require different concurrency strategies. Search and zipcode modes use conservative concurrency settings to avoid overwhelming search result pages, while details mode can employ higher concurrency for property detail pages which are generally more tolerant of parallel access. The system automatically adjusts these settings based on response times and error rates.

**Resource Allocation Optimization**:
The system includes sophisticated resource management that balances extraction speed with data quality. Memory usage is continuously monitored and optimized through automatic cleanup of unused selectors and performance data. Request queue management prevents overwhelming the target website while maximizing extraction efficiency.

### **Advanced Error Recovery Systems**

The multi-layer error recovery system ensures maximum reliability and data quality even when facing challenging extraction conditions.

**Selector-Level Recovery**:
When a specific selector fails, the system automatically progresses through the hierarchical selector list before escalating to AI-powered generation. This approach ensures that temporary failures don't immediately trigger expensive AI calls while maintaining the ability to adapt to structural changes.

**Page-Level Recovery**:
If an entire page fails to load or parse correctly, the system logs detailed error information and continues with other pages, preventing single failures from compromising the entire extraction process. The error logging includes context information that enables rapid troubleshooting and system optimization.

**Anti-Bot Mitigation**:
The system includes sophisticated anti-bot detection and mitigation strategies. When blocking is detected, the system implements appropriate delays, proxy rotation, and request pattern adjustments to restore access. The mitigation strategies are continuously refined based on observed blocking patterns and success rates.

## 🔒 Best Practices and Compliance

### **Respectful Scraping Implementation**

The actor is designed with deep respect for website resources and compliance with best practices for automated data collection.

**Rate Limiting and Resource Management**:
Appropriate delays between requests prevent overwhelming the target website's servers while maintaining efficient extraction speeds. The system includes intelligent request spacing that adapts to website response times and implements exponential backoff for failed requests.

**Proxy Management and Distribution**:
Built-in proxy support distributes requests across multiple IP addresses to avoid triggering rate limits while maintaining extraction continuity. The proxy management system includes automatic rotation and health monitoring to ensure optimal performance.

### **Data Quality Assurance**

**Comprehensive Validation Systems**:
All extracted data undergoes rigorous validation to ensure accuracy and completeness before being saved. The validation system includes format checking, range validation, and consistency verification across related data fields.

**Completeness Tracking and Optimization**:
The system continuously monitors extraction success rates and identifies patterns in missing data to optimize selector performance. This monitoring enables proactive identification of extraction issues and systematic improvement of data quality.

### **Privacy and Security Considerations**

**Contact Information Handling**:
Agent contact information is extracted only when explicitly requested and is handled according to data privacy best practices. The system includes configurable options for controlling the level of contact information extraction based on specific use case requirements.

**Secure Data Processing**:
All extracted data is processed through Apify's secure infrastructure with appropriate access controls and encryption. The system includes audit logging for compliance monitoring and security analysis.

## 📞 Support and Troubleshooting

### **Common Issues and Solutions**

**Low Success Rates**:
If extraction success rates are below expectations, first check the selector performance statistics in the output logs. Enable AI-powered updates if not already active, and review proxy configuration and rate limiting settings. The test mode provides detailed debugging information that can help identify specific extraction issues.

**Blocking and Access Issues**:
If the system encounters blocking or access denial, verify proxy configuration and reduce concurrency settings. Check the logs for anti-bot detection patterns and adjust request timing accordingly. The system includes automatic blocking detection and recovery, but manual adjustment of settings may be necessary for challenging websites.

**Data Quality Problems**:
For data quality issues, review the validation settings and extraction options in the configuration. Enable test mode for detailed debugging information and examine the sample output for patterns in missing or incorrect data. The keyword filtering settings may also affect the final data quality if too restrictive.

**Performance Optimization**:
To optimize performance, review the concurrency settings and adjust based on the specific requirements of your use case. Monitor cache performance statistics and selector effectiveness through the performance metadata. The discovery mode settings can significantly impact both performance and data coverage.

### **Advanced Debugging Techniques**

**Test Mode Analysis**:
Enable test mode for comprehensive debugging information including detailed error logs, selector performance statistics, and extraction timing data. This mode provides extensive diagnostic information that can help identify and resolve complex extraction issues.

**Performance Analytics Review**:
Examine the selector statistics, cache hit rates, and extraction success rates provided in the performance metadata. These analytics provide insights into system performance and can guide optimization efforts.

**Sample Data Examination**:
Review extracted data samples for patterns in missing or incorrect information. The system provides detailed metadata about extraction methods and success rates that can help identify systematic issues.

This unified Zillow scraper represents the pinnacle of automated property data collection technology, combining the specialized functionality of three separate actors into a single, powerful, and intelligent system. The four-mode architecture provides unprecedented flexibility for different use cases, while the AI-powered selector management ensures consistent performance and minimal maintenance requirements. Whether you're conducting market research, identifying investment opportunities, or generating leads, this unified solution provides the comprehensive functionality and reliability needed for professional property data collection at scale.

