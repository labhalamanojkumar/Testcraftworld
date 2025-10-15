# BlogStreamPro API Integration Guide

This guide explains how to integrate external AI tools and agents with your BlogStreamPro platform using the REST API.

## Overview

BlogStreamPro provides a comprehensive API that allows external AI tools, chatbots, automation systems, and other applications to interact with your blog platform. The API includes endpoints for content generation, analysis, optimization, and analytics insights.

## Authentication

All API requests require authentication using API keys. API keys are managed through the admin dashboard and can have specific permissions.

### API Key Authentication

Include the API key in the request header:
```
X-API-Key: your-api-key-here
```

### Permissions

API keys can be granted the following permissions:
- `content:generate` - Generate new content
- `content:analyze` - Analyze existing content
- `seo:optimize` - Get SEO optimization suggestions
- `insights:read` - Access analytics insights
- `*` - Full access to all endpoints

## Endpoints

### Content Generation

Generate blog content, social media posts, or other content types using AI.

**Endpoint:** `POST /api/ai/generate-content`

**Request Body:**
```json
{
  "topic": "React Best Practices",
  "type": "article",
  "categoryId": "optional-category-id",
  "keywords": ["react", "javascript", "frontend"],
  "tone": "professional",
  "length": "medium",
  "targetAudience": "developers"
}
```

**Response:**
```json
{
  "content": "Generated content here...",
  "title": "Generated Title",
  "excerpt": "Content excerpt",
  "tags": ["tag1", "tag2"],
  "seoScore": 85,
  "generatedAt": "2025-10-15T10:30:00Z",
  "metadata": {
    "type": "article",
    "topic": "React Best Practices",
    "wordCount": 800
  }
}
```

### Content Analysis

Analyze existing content for SEO, readability, and engagement metrics.

**Endpoint:** `POST /api/ai/analyze-content`

**Request Body:**
```json
{
  "content": "Your article content here...",
  "title": "Article Title",
  "keywords": ["keyword1", "keyword2"]
}
```

**Response:**
```json
{
  "seoScore": 78,
  "readabilityScore": 72,
  "keywordDensity": {
    "keyword1": 5,
    "keyword2": 3
  },
  "suggestions": [
    "Consider adding more internal links",
    "Improve keyword density"
  ],
  "wordCount": 1200,
  "readingTime": 6,
  "analyzedAt": "2025-10-15T10:30:00Z"
}
```

### SEO Optimization

Get SEO optimization suggestions for content.

**Endpoint:** `POST /api/ai/optimize-seo`

**Request Body:**
```json
{
  "content": "Your content...",
  "title": "Current title",
  "targetKeyword": "primary keyword",
  "metaDescription": "Current meta description"
}
```

### Analytics Insights

Get AI-powered insights about blog performance.

**Endpoint:** `GET /api/ai/insights?type=performance&timeframe=30d`

**Query Parameters:**
- `type`: `performance`, `content`, `audience`, `trends`
- `timeframe`: `7d`, `30d`, `90d`

## Integration Examples

### ChatGPT Integration

Use the API to generate content based on user requests:

```javascript
// When user asks to generate a blog post
const response = await fetch('/api/ai/generate-content', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key'
  },
  body: JSON.stringify({
    topic: userTopic,
    type: 'article',
    keywords: userKeywords
  })
});

const result = await response.json();
// Use result.content in your response
```

### Automation Workflows

Set up automated content publishing:

```javascript
// Generate weekly content summary
const insights = await fetch('/api/ai/insights?type=content&timeframe=7d', {
  headers: { 'X-API-Key': 'your-api-key' }
}).then(r => r.json());

// Generate newsletter content
const newsletter = await fetch('/api/ai/generate-content', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key'
  },
  body: JSON.stringify({
    topic: `Weekly Newsletter - ${new Date().toLocaleDateString()}`,
    type: 'newsletter',
    tone: 'engaging'
  })
}).then(r => r.json());
```

### SEO Monitoring

Monitor and optimize content SEO:

```javascript
// Analyze all published articles
const articles = await fetch('/api/articles').then(r => r.json());

for (const article of articles.filter(a => a.published)) {
  const analysis = await fetch('/api/ai/analyze-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'your-api-key'
    },
    body: JSON.stringify({
      content: article.content,
      title: article.title,
      keywords: article.tags ? JSON.parse(article.tags) : []
    })
  }).then(r => r.json());

  if (analysis.seoScore < 70) {
    // Get optimization suggestions
    const optimization = await fetch('/api/ai/optimize-seo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'your-api-key'
      },
      body: JSON.stringify({
        content: article.content,
        title: article.title,
        targetKeyword: article.metaTitle || article.title
      })
    }).then(r => r.json());

    // Apply suggestions or notify admin
  }
}
```

## Rate Limiting

- API requests are rate limited to prevent abuse
- Default limits: 100 requests per hour per API key
- Higher limits available for premium integrations

## Error Handling

All API responses include appropriate HTTP status codes:

- `200` - Success
- `401` - Invalid or missing API key
- `403` - Insufficient permissions
- `429` - Rate limit exceeded
- `500` - Server error

Error responses include a JSON object with an `error` field describing the issue.

## Support

For API integration support:
1. Check the interactive API documentation at `/api-docs`
2. Review this guide for examples
3. Contact the development team for custom integrations

## Security Best Practices

1. **Store API keys securely** - Never expose them in client-side code
2. **Use HTTPS** - Always make API calls over secure connections
3. **Rotate keys regularly** - Generate new keys periodically
4. **Monitor usage** - Track API key usage in the admin dashboard
5. **Limit permissions** - Only grant necessary permissions to each key