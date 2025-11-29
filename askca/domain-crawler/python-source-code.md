# California Government Crawler - Python Source Code

All Python source code files for the crawler implementation.

---

## ca_crawler/settings.py

```python
# Scrapy settings for ca_crawler project
import os
from dotenv import load_dotenv

load_dotenv()

BOT_NAME = 'ca_crawler'
SPIDER_MODULES = ['ca_crawler.spiders']
NEWSPIDER_MODULE = 'ca_crawler.spiders'

# Crawl responsibly by identifying yourself
USER_AGENT = os.getenv('CRAWLER_USER_AGENT', 'CaliforniaGovCrawler/1.0')

# Obey robots.txt rules
ROBOTSTXT_OBEY = os.getenv('ROBOTSTXT_OBEY', 'True').lower() == 'true'

# Configure maximum concurrent requests
CONCURRENT_REQUESTS = int(os.getenv('CONCURRENT_REQUESTS', 16))
CONCURRENT_REQUESTS_PER_DOMAIN = int(os.getenv('CONCURRENT_REQUESTS_PER_DOMAIN', 2))

# Configure a delay for requests for the same website
DOWNLOAD_DELAY = float(os.getenv('DOWNLOAD_DELAY', 1.0))
RANDOMIZE_DOWNLOAD_DELAY = True

# Enable AutoThrottle for dynamic delay adjustment
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 1.0
AUTOTHROTTLE_MAX_DELAY = 10.0
AUTOTHROTTLE_TARGET_CONCURRENCY = 2.0

# Depth limit
DEPTH_LIMIT = int(os.getenv('MAX_DEPTH', 5))

# Redis Configuration for Scrapy-Redis
REDIS_URL = os.getenv('REDIS_URL', 'redis://redis:6379/0')

# Enable Scrapy-Redis Scheduler
SCHEDULER = "scrapy_redis.scheduler.Scheduler"
DUPEFILTER_CLASS = "ca_crawler.middlewares.BloomFilterDupeFilter"
SCHEDULER_PERSIST = True
SCHEDULER_QUEUE_CLASS = 'scrapy_redis.queue.PriorityQueue'

# Item Pipelines
ITEM_PIPELINES = {
    'ca_crawler.pipelines.URLNormalizationPipeline': 100,
    'ca_crawler.pipelines.ContentHashPipeline': 200,
    'ca_crawler.pipelines.PostgreSQLPipeline': 300,
    'ca_crawler.pipelines.Neo4jPipeline': 400,
}

# PostgreSQL Configuration
POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'postgres')
POSTGRES_PORT = int(os.getenv('POSTGRES_PORT', 5432))
POSTGRES_DB = os.getenv('POSTGRES_DB', 'crawler_db')
POSTGRES_USER = os.getenv('POSTGRES_USER', 'crawler')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', 'password')

# Neo4j Configuration
NEO4J_URI = os.getenv('NEO4J_URI', 'bolt://neo4j:7687')
NEO4J_USER = os.getenv('NEO4J_USER', 'neo4j')
NEO4J_PASSWORD = os.getenv('NEO4J_PASSWORD', 'password')

# Bloom Filter Configuration
BLOOM_FILTER_CAPACITY = int(os.getenv('BLOOM_FILTER_CAPACITY', 10000000))
BLOOM_FILTER_ERROR_RATE = float(os.getenv('BLOOM_FILTER_ERROR_RATE', 0.001))

# Logging
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_FILE = '/app/logs/crawler.log'
LOG_FORMAT = '%(asctime)s [%(name)s] %(levelname)s: %(message)s'
LOG_DATEFORMAT = '%Y-%m-%d %H:%M:%S'

# Download Handlers
DOWNLOAD_HANDLERS = {
    "http": "scrapy.core.downloader.handlers.http.HTTPDownloadHandler",
    "https": "scrapy.core.downloader.handlers.http.HTTPDownloadHandler",
}

# Retry Configuration
RETRY_ENABLED = True
RETRY_TIMES = 3
RETRY_HTTP_CODES = [500, 502, 503, 504, 522, 524, 408, 429]

# Cache Configuration
HTTPCACHE_ENABLED = False

# Telnet Console
TELNETCONSOLE_ENABLED = False

# Cookies
COOKIES_ENABLED = False

# Download Timeout
DOWNLOAD_TIMEOUT = 30

# Request Fingerprinter
REQUEST_FINGERPRINTER_IMPLEMENTATION = '2.7'
```

---

## ca_crawler/items.py

```python
import scrapy
from itemadapter import ItemAdapter


class PageItem(scrapy.Item):
    '''Represents a crawled web page'''
    
    # URL Information
    url = scrapy.Field()
    url_hash = scrapy.Field()
    normalized_url = scrapy.Field()
    hostname = scrapy.Field()
    domain = scrapy.Field()
    
    # HTTP Response
    status_code = scrapy.Field()
    content_type = scrapy.Field()
    content_length = scrapy.Field()
    
    # Timestamps
    crawled_at = scrapy.Field()
    
    # Content
    title = scrapy.Field()
    meta_description = scrapy.Field()
    text_content = scrapy.Field()
    
    # Links
    outbound_links = scrapy.Field()
    outbound_link_count = scrapy.Field()
    
    # Metadata
    depth = scrapy.Field()
    priority = scrapy.Field()
    parent_url = scrapy.Field()
    
    # Deduplication
    content_hash = scrapy.Field()
    simhash_value = scrapy.Field()
    
    # Headers
    etag = scrapy.Field()
    last_modified = scrapy.Field()
```

---

## ca_crawler/spiders/ca_gov_spider.py

```python
import scrapy
from scrapy.linkextractors import LinkExtractor
from scrapy_redis.spiders import RedisSpider
from ca_crawler.items import PageItem
from ca_crawler.utils.url_utils import normalize_url, extract_domain
import hashlib
from datetime import datetime
from urllib.parse import urlparse
import logging


class CaGovSpider(RedisSpider):
    '''Spider for crawling California government websites'''
    
    name = 'ca_gov'
    redis_key = 'ca_crawler:start_urls'
    
    # Only crawl .ca.gov domains
    allowed_domains = ['ca.gov']
    
    # Link extractor configuration
    link_extractor = LinkExtractor(
        allow_domains=allowed_domains,
        deny_extensions=[
            # Images
            'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'ico', 'webp',
            # Videos
            'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm',
            # Audio
            'mp3', 'wav', 'ogg', 'flac',
            # Documents (we track but don't parse)
            'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
            # Archives
            'zip', 'tar', 'gz', 'rar', '7z',
            # Executables
            'exe', 'dmg', 'pkg', 'deb', 'rpm',
        ],
        deny=[
            # Admin pages
            r'/wp-admin/',
            r'/admin/',
            r'/login',
            r'/logout',
            # API endpoints
            r'/api/',
            r'\\.json$',
            r'\\.xml$',
            # Search results
            r'\\?s=',
            r'/search\\?',
        ],
        tags=('a', 'area'),
        attrs=('href',),
        canonicalize=True,
        unique=True,
    )
    
    custom_settings = {
        'DEPTH_PRIORITY': 1,
        'SCHEDULER_DISK_QUEUE': 'scrapy.squeues.PickleFifoDiskQueue',
        'SCHEDULER_MEMORY_QUEUE': 'scrapy.squeues.FifoMemoryQueue',
    }
    
    def __init__(self, *args, **kwargs):
        super(CaGovSpider, self).__init__(*args, **kwargs)
        self.logger.info(f"Spider {self.name} initialized")
    
    def parse(self, response):
        '''Parse a response and extract data'''
        
        # Skip non-HTML responses
        content_type = response.headers.get('Content-Type', b'').decode('utf-8').lower()
        if 'text/html' not in content_type:
            self.logger.debug(f"Skipping non-HTML: {response.url}")
            return
        
        # Extract page data
        item = PageItem()
        
        # URL information
        item['url'] = response.url
        item['normalized_url'] = normalize_url(response.url)
        item['url_hash'] = hashlib.sha256(response.url.encode()).hexdigest()
        parsed_url = urlparse(response.url)
        item['hostname'] = parsed_url.hostname
        item['domain'] = extract_domain(response.url)
        
        # HTTP response
        item['status_code'] = response.status
        item['content_type'] = content_type
        item['content_length'] = len(response.body)
        
        # Timestamps
        item['crawled_at'] = datetime.utcnow().isoformat()
        
        # Content extraction
        item['title'] = response.css('title::text').get(default='').strip()
        item['meta_description'] = response.css('meta[name="description"]::attr(content)').get(default='').strip()
        
        # Extract text content (simplified)
        text_elements = response.css('p::text, h1::text, h2::text, h3::text, li::text').getall()
        item['text_content'] = ' '.join([t.strip() for t in text_elements if t.strip()])[:5000]
        
        # Extract outbound links
        links = self.link_extractor.extract_links(response)
        item['outbound_links'] = [link.url for link in links]
        item['outbound_link_count'] = len(links)
        
        # Metadata
        item['depth'] = response.meta.get('depth', 0)
        item['parent_url'] = response.meta.get('parent_url', '')
        item['priority'] = self.calculate_priority(item)
        
        # HTTP headers for caching
        item['etag'] = response.headers.get('ETag', b'').decode('utf-8')
        item['last_modified'] = response.headers.get('Last-Modified', b'').decode('utf-8')
        
        yield item
        
        # Follow links
        for link in links:
            yield scrapy.Request(
                url=link.url,
                callback=self.parse,
                meta={
                    'parent_url': response.url,
                    'depth': response.meta.get('depth', 0) + 1,
                },
                priority=self.calculate_link_priority(link, response.meta.get('depth', 0)),
                dont_filter=False,
            )
    
    def calculate_priority(self, item):
        '''Calculate URL priority score (0-1)'''
        priority = 0.5
        
        # Depth factor (shallower = higher priority)
        depth = item.get('depth', 0)
        depth_score = max(0, 1 - (depth / 5.0))
        priority += depth_score * 0.3
        
        # Homepage bonus
        if item['url'].rstrip('/').endswith(item['domain']):
            priority += 0.2
        
        # Important paths
        important_paths = ['/about', '/services', '/contact', '/department']
        if any(path in item['url'].lower() for path in important_paths):
            priority += 0.1
        
        return min(1.0, priority)
    
    def calculate_link_priority(self, link, current_depth):
        '''Calculate priority for extracted links'''
        priority = -current_depth  # Negative so higher depth = lower priority
        
        # Boost important-looking URLs
        url_lower = link.url.lower()
        if any(term in url_lower for term in ['index', 'home', 'main']):
            priority += 10
        if any(term in url_lower for term in ['about', 'service', 'program']):
            priority += 5
        
        return priority
```

View complete source code in the next file...
