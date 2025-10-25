import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { randomUUID } from "crypto";
import { db } from "./db";
import { apiKeys } from "../shared/schema";
import { eq, and, sql } from "drizzle-orm";

// API Key management table (add to schema if not exists)
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  hashedKey: string;
  // permissions may be stored as a JSON string in the DB or as an array when hydrated
  permissions: string | string[];
  createdBy: string; // user ID
  createdAt: Date;
  lastUsed?: Date;
  isActive: boolean;
}

// Middleware to validate API key
export const validateApiKey = async (req: Request, res: Response, next: any) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    // Check if API key exists and is active
    const keyRecord = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.key, apiKey), eq(apiKeys.isActive, true)))
      .limit(1);

    if (!keyRecord.length) {
      return res.status(401).json({ error: 'Invalid or inactive API key' });
    }

    const key = keyRecord[0];

    // Check if key has expired
    if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
      return res.status(401).json({ error: 'API key has expired' });
    }

    // Check IP whitelist if configured
    if (key.allowedIps) {
      try {
        const allowedIps = JSON.parse(key.allowedIps as string);
        const clientIp = req.ip || req.headers['x-forwarded-for'] as string;
        if (allowedIps.length > 0 && !allowedIps.includes(clientIp)) {
          return res.status(403).json({ error: 'IP address not authorized' });
        }
      } catch (e) {
        console.error('Error parsing allowed IPs:', e);
      }
    }

    // Check rate limit (simple hourly check)
    const usageCount = key.usageCount || 0;
    const rateLimit = key.rateLimit || 100;
    
    // In production, implement proper rate limiting with time windows
    // For now, just check total usage
    if (usageCount >= rateLimit * 24) { // Daily limit approximation
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    // Update last used timestamp and increment usage count
    await db
      .update(apiKeys)
      .set({ 
        lastUsed: new Date(),
        usageCount: sql`${apiKeys.usageCount} + 1`
      })
      .where(eq(apiKeys.id, key.id));

    // Attach key info to request
    (req as any).apiKey = key;
    next();
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({ error: 'API key validation failed' });
  }
};

// Check if user has permission for an action
const hasPermission = (apiKey: ApiKey, permission: string): boolean => {
  let permissions: string[] = [];

  if (!apiKey || apiKey.permissions == null) return false;

  if (typeof apiKey.permissions === 'string') {
    try {
      permissions = JSON.parse(apiKey.permissions || '[]');
    } catch (e) {
      // Fallback: if it's a comma-separated string
      permissions = (apiKey.permissions as string).split(',').map(p => p.trim()).filter(Boolean);
    }
  } else if (Array.isArray(apiKey.permissions)) {
    permissions = apiKey.permissions as string[];
  }

  return permissions.includes(permission) || permissions.includes('*');
};

/**
 * @swagger
 * /api/ai/generate-content:
 *   post:
 *     summary: Generate content using AI
 *     description: Generate blog content, summaries, or social media posts using AI
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContentGenerationRequest'
 *     responses:
 *       200:
 *         description: Generated content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *                   description: Generated content
 *                 title:
 *                   type: string
 *                   description: Generated or suggested title
 *                 excerpt:
 *                   type: string
 *                   description: Content excerpt
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                 seoScore:
 *                   type: integer
 *                   description: SEO optimization score (0-100)
 *       401:
 *         description: Unauthorized - Invalid API key
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
export const generateContent = async (req: Request, res: Response) => {
  try {
    const apiKey = (req as any).apiKey;
    if (!hasPermission(apiKey, 'content:generate')) {
      return res.status(403).json({ error: 'Insufficient permissions: content:generate required' });
    }

    const { topic, type, categoryId, keywords, tone, length, targetAudience } = req.body;

    // Mock AI content generation (replace with actual AI service integration)
    const generatedContent = await mockContentGeneration({
      topic,
      type,
        categoryId,
        keywords,
        tone,
        length,
        targetAudience
      });

      res.json(generatedContent);
    } catch (error) {
      console.error('Generate content error:', error);
      res.status(500).json({ error: 'Content generation failed' });
    }
};

/**
 * @swagger
 * /api/ai/analyze-content:
 *   post:
 *     summary: Analyze existing content
 *     description: Analyze article content for SEO, readability, and engagement metrics
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Content to analyze
 *               title:
 *                 type: string
 *                 description: Content title
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Target keywords
 *     responses:
 *       200:
 *         description: Content analysis results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 seoScore:
 *                   type: integer
 *                   description: Overall SEO score (0-100)
 *                 readabilityScore:
 *                   type: number
 *                   description: Readability score
 *                 keywordDensity:
 *                   type: object
 *                   description: Keyword density analysis
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Improvement suggestions
 *                 wordCount:
 *                   type: integer
 *                 readingTime:
 *                   type: integer
 *                   description: Estimated reading time in minutes
 */
export const analyzeContent = async (req: Request, res: Response) => {
  try {
    const apiKey = (req as any).apiKey;
    if (!hasPermission(apiKey, 'content:analyze')) {
      return res.status(403).json({ error: 'Insufficient permissions: content:analyze required' });
    }

    const { content, title, keywords } = req.body;

    const analysis = await mockContentAnalysis(content, title, keywords || []);

    res.json({
      seoScore: analysis.seoScore,
      readabilityScore: analysis.readabilityScore,
      keywordDensity: analysis.keywordDensity,
      suggestions: analysis.suggestions,
      wordCount: analysis.wordCount,
      readingTime: analysis.readingTime,
      analyzedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Content analysis error:', error);
    res.status(500).json({ error: 'Content analysis failed' });
  }
};

/**
 * @swagger
 * /api/ai/insights:
 *   get:
 *     summary: Get AI-powered insights
 *     description: Retrieve AI-generated insights about blog performance and content strategy
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [performance, content, audience, trends]
 *         description: Type of insights to retrieve
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d]
 *         description: Timeframe for analysis
 *     responses:
 *       200:
 *         description: AI-generated insights
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 insights:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       impact:
 *                         type: string
 *                         enum: [high, medium, low]
 *                       actionable:
 *                         type: boolean
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     type: string
 */
export const getInsights = async (req: Request, res: Response) => {
  try {
    const apiKey = (req as any).apiKey;
    if (!hasPermission(apiKey, 'insights:read')) {
      return res.status(403).json({ error: 'Insufficient permissions: insights:read required' });
    }

    const { type = 'performance', timeframe = '30d' } = req.query;

    // Get analytics data
    const analytics = await storage.getDetailedAnalytics();

    // Generate AI insights based on analytics
    const insights = await mockInsightsGeneration(analytics, type as string, timeframe as string);

    res.json({
      insights: insights.insights,
      recommendations: insights.recommendations,
      generatedAt: new Date().toISOString(),
      timeframe,
      type
    });
  } catch (error) {
    console.error('Insights generation error:', error);
    res.status(500).json({ error: 'Insights generation failed' });
  }
};

/**
 * @swagger
 * /api/ai/optimize-seo:
 *   post:
 *     summary: Optimize content for SEO
 *     description: Get SEO optimization suggestions for existing content
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - targetKeyword
 *             properties:
 *               content:
 *                 type: string
 *               title:
 *                 type: string
 *               targetKeyword:
 *                 type: string
 *               metaDescription:
 *                 type: string
 *     responses:
 *       200:
 *         description: SEO optimization suggestions
 */
export const optimizeSEO = async (req: Request, res: Response) => {
  try {
    const apiKey = (req as any).apiKey;
    if (!hasPermission(apiKey, 'seo:optimize')) {
      return res.status(403).json({ error: 'Insufficient permissions: seo:optimize required' });
    }

    const { content, title, targetKeyword, metaDescription } = req.body;

    const optimization = await mockSEOOptimization({
      content,
      title,
      targetKeyword,
      metaDescription
    });

    res.json({
      suggestions: optimization.suggestions,
      optimizedTitle: optimization.optimizedTitle,
      optimizedMetaDescription: optimization.optimizedMetaDescription,
      keywordRecommendations: optimization.keywordRecommendations,
      score: optimization.score
    });
  } catch (error) {
    console.error('SEO optimization error:', error);
    res.status(500).json({ error: 'SEO optimization failed' });
  }
};

/**
 * @swagger
 * /api/admin/api-keys:
 *   get:
 *     summary: List API keys
 *     description: Get all API keys for the authenticated user
 *     security:
 *       - SessionAuth: []
 *     responses:
 *       200:
 *         description: List of API keys
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ApiKey'
 *   post:
 *     summary: Create API key
 *     description: Create a new API key with specified permissions
 *     security:
 *       - SessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - permissions
 *             properties:
 *               name:
 *                 type: string
 *                 description: API key name
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of permissions
 *     responses:
 *       201:
 *         description: API key created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiKey'
 */
export const listApiKeys = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const user = req.user as any;
    const includeInactive = (req.query.includeInactive === 'true');
    
    // Superadmin can see all keys, regular users see only their own
    let query;
    if (user.role === 'superadmin' || user.role === 'admin') {
      query = db.select({
        id: apiKeys.id,
        name: apiKeys.name,
        key: sql`CONCAT(SUBSTRING(${apiKeys.key}, 1, 8), '...')`.as('maskedKey'),
        permissions: apiKeys.permissions,
        scopes: apiKeys.scopes,
        rateLimit: apiKeys.rateLimit,
        allowedIps: apiKeys.allowedIps,
        expiresAt: apiKeys.expiresAt,
        createdAt: apiKeys.createdAt,
        lastUsed: apiKeys.lastUsed,
        usageCount: apiKeys.usageCount,
        isActive: apiKeys.isActive,
        metadata: apiKeys.metadata,
        createdBy: apiKeys.createdBy,
      }).from(apiKeys);
      if (!includeInactive) {
        query = query.where(eq(apiKeys.isActive, true));
      }
    } else {
      query = db.select({
        id: apiKeys.id,
        name: apiKeys.name,
        key: sql`CONCAT(SUBSTRING(${apiKeys.key}, 1, 8), '...')`.as('maskedKey'),
        permissions: apiKeys.permissions,
        scopes: apiKeys.scopes,
        rateLimit: apiKeys.rateLimit,
        allowedIps: apiKeys.allowedIps,
        expiresAt: apiKeys.expiresAt,
        createdAt: apiKeys.createdAt,
        lastUsed: apiKeys.lastUsed,
        usageCount: apiKeys.usageCount,
        isActive: apiKeys.isActive,
        metadata: apiKeys.metadata,
      }).from(apiKeys).where(
        includeInactive
          ? eq(apiKeys.createdBy, user.id)
          : and(eq(apiKeys.createdBy, user.id), eq(apiKeys.isActive, true))
      );
    }

    const keys = await query;

    // Parse JSON fields
    const formattedKeys = keys.map(key => ({
      ...key,
      permissions: key.permissions ? JSON.parse(key.permissions as string) : [],
      scopes: key.scopes ? JSON.parse(key.scopes as string) : null,
      allowedIps: key.allowedIps ? JSON.parse(key.allowedIps as string) : null,
      metadata: key.metadata ? JSON.parse(key.metadata as string) : null,
    }));

    res.json(formattedKeys);
  } catch (error) {
    console.error('List API keys error:', error);
    res.status(500).json({ error: 'Failed to list API keys' });
  }
};

export const createApiKey = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const user = req.user as any;
    
    // Check if user is admin or superadmin
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, permissions, scopes, rateLimit, allowedIps, expiresAt, metadata } = req.body;

    if (!name || !permissions) {
      return res.status(400).json({ error: 'Name and permissions are required' });
    }

    // Generate API key
    const key = `bkp_${randomUUID().replace(/-/g, '')}`;
    const hashedKey = key; // In production, use bcrypt or similar

    const newKey = {
      id: randomUUID(),
      name,
      key,
      hashedKey,
      permissions: JSON.stringify(permissions),
      scopes: scopes ? JSON.stringify(scopes) : null,
      rateLimit: rateLimit || 100,
      allowedIps: allowedIps ? JSON.stringify(allowedIps) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: user.id,
      createdAt: new Date(),
      usageCount: 0,
      isActive: true,
      metadata: metadata ? JSON.stringify(metadata) : null,
    };

    await db.insert(apiKeys).values(newKey);

    res.status(201).json({
      id: newKey.id,
      name: newKey.name,
      key: newKey.key, // Only show on creation
      permissions: JSON.parse(newKey.permissions),
      scopes: newKey.scopes ? JSON.parse(newKey.scopes) : null,
      rateLimit: newKey.rateLimit,
      allowedIps: newKey.allowedIps ? JSON.parse(newKey.allowedIps) : null,
      expiresAt: newKey.expiresAt,
      createdAt: newKey.createdAt,
      usageCount: newKey.usageCount,
      isActive: newKey.isActive,
      metadata: newKey.metadata ? JSON.parse(newKey.metadata) : null,
    });
  } catch (error) {
    console.error('Create API key error:', error);
    res.status(500).json({ error: 'Failed to create API key' });
  }
};

/**
 * @swagger
 * /api/admin/api-keys/{id}:
 *   delete:
 *     summary: Delete API key
 *     description: Deactivate an API key
 *     security:
 *       - SessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: API key deactivated
 */
export const deleteApiKey = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      console.log('Delete API key: Unauthorized - no user');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { permanent } = req.query; // Check if permanent delete is requested
    const user = req.user as any;

    console.log('Deleting API key:', { id, userId: user.id, userRole: user.role, permanent: permanent === 'true' });

    // Admin can delete any key, regular users only their own
    const condition = user.role === 'superadmin' || user.role === 'admin'
      ? eq(apiKeys.id, id)
      : and(eq(apiKeys.id, id), eq(apiKeys.createdBy, user.id));

    if (permanent === 'true') {
      // Hard delete - permanently remove from database
      const result = await db
        .delete(apiKeys)
        .where(condition);

      console.log('Permanent delete result:', result);
      res.json({ success: true, message: 'API key permanently deleted' });
    } else {
      // Soft delete - just deactivate
      const result = await db
        .update(apiKeys)
        .set({ isActive: false })
        .where(condition);

      console.log('Deactivate result:', result);
      res.json({ success: true });
    }
  } catch (error) {
    console.error('Delete API key error:', error);
    res.status(500).json({ error: 'Failed to delete API key', details: String(error) });
  }
};

// Update API key (permissions, rate limit, etc.)
export const updateApiKey = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const { name, permissions, scopes, rateLimit, allowedIps, expiresAt, isActive, metadata } = req.body;
    const user = req.user as any;

    // Admin can update any key, regular users only their own
    const condition = user.role === 'superadmin' || user.role === 'admin'
      ? eq(apiKeys.id, id)
      : and(eq(apiKeys.id, id), eq(apiKeys.createdBy, user.id));

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (permissions !== undefined) updates.permissions = JSON.stringify(permissions);
    if (scopes !== undefined) updates.scopes = scopes ? JSON.stringify(scopes) : null;
    if (rateLimit !== undefined) updates.rateLimit = rateLimit;
    if (allowedIps !== undefined) updates.allowedIps = allowedIps ? JSON.stringify(allowedIps) : null;
    if (expiresAt !== undefined) updates.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (isActive !== undefined) updates.isActive = isActive;
    if (metadata !== undefined) updates.metadata = metadata ? JSON.stringify(metadata) : null;

    await db.update(apiKeys).set(updates).where(condition);

    res.json({ success: true });
  } catch (error) {
    console.error('Update API key error:', error);
    res.status(500).json({ error: 'Failed to update API key' });
  }
};

// Regenerate API key (creates new key string, keeps same permissions)
export const regenerateApiKey = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const user = req.user as any;

    // Admin can regenerate any key, regular users only their own
    const condition = user.role === 'superadmin' || user.role === 'admin'
      ? eq(apiKeys.id, id)
      : and(eq(apiKeys.id, id), eq(apiKeys.createdBy, user.id));

    // Generate new API key
    const newKey = `bkp_${randomUUID().replace(/-/g, '')}`;
    const hashedKey = newKey;

    await db.update(apiKeys)
      .set({ key: newKey, hashedKey, usageCount: 0 })
      .where(condition);

    res.json({ success: true, newKey }); // Only show new key once
  } catch (error) {
    console.error('Regenerate API key error:', error);
    res.status(500).json({ error: 'Failed to regenerate API key' });
  }
};

// Get API key statistics
export const getApiKeyStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const user = req.user as any;

    const condition = user.role === 'superadmin' || user.role === 'admin'
      ? eq(apiKeys.id, id)
      : and(eq(apiKeys.id, id), eq(apiKeys.createdBy, user.id));

    const [keyData] = await db.select().from(apiKeys).where(condition).limit(1);

    if (!keyData) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json({
      id: keyData.id,
      name: keyData.name,
      usageCount: keyData.usageCount || 0,
      lastUsed: keyData.lastUsed,
      createdAt: keyData.createdAt,
      rateLimit: keyData.rateLimit,
      isActive: keyData.isActive,
    });
  } catch (error) {
    console.error('Get API key stats error:', error);
    res.status(500).json({ error: 'Failed to get API key statistics' });
  }
};

// Mock AI functions (replace with actual AI service calls)
async function mockContentGeneration(params: any) {
  const { topic, type, keywords, tone, length, targetAudience } = params;

  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const wordCounts: Record<string, number> = { short: 300, medium: 800, long: 1500 };
  const wordCount = wordCounts[length as keyof typeof wordCounts] || 800;

  return {
    title: `${topic} - A Comprehensive Guide`,
    content: `This is a mock AI-generated ${type} about ${topic}. In a real implementation, this would be generated by an AI service like OpenAI, Anthropic, or Google Gemini.

The content would be tailored to the specified tone (${tone}), target audience (${targetAudience || 'general'}), and include relevant keywords: ${keywords.join(', ')}.

This is just placeholder content for demonstration purposes. The actual AI integration would produce high-quality, engaging content based on the input parameters.`,
    excerpt: `Learn everything about ${topic} in this comprehensive guide covering key aspects and best practices.`,
    tags: keywords,
    seoScore: Math.floor(Math.random() * 40) + 60, // 60-100
    wordCount
  };
}

async function mockContentAnalysis(content: string, title: string, keywords: string[]) {
  const wordCount = content.split(' ').length;
  const readingTime = Math.ceil(wordCount / 200); // 200 words per minute

  return {
    seoScore: Math.floor(Math.random() * 40) + 50,
    readabilityScore: Math.floor(Math.random() * 30) + 60,
    keywordDensity: keywords.reduce((acc, keyword) => {
      const count = (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      acc[keyword] = count;
      return acc;
    }, {} as Record<string, number>),
    suggestions: [
      'Consider adding more internal links',
      'Improve keyword density for better SEO',
      'Add more descriptive headings',
      'Include relevant images with alt text'
    ],
    wordCount,
    readingTime
  };
}

async function mockInsightsGeneration(analytics: any, type: string, timeframe: string) {
  const insights = [];
  const recommendations = [];

  if (type === 'performance') {
    insights.push({
      type: 'performance',
      title: 'High Bounce Rate Detected',
      description: `Your bounce rate is ${analytics.bounceRate.toFixed(1)}%, which is above the recommended 40%.`,
      impact: 'high',
      actionable: true
    });

    if (analytics.totalPageViews > 1000) {
      insights.push({
        type: 'performance',
        title: 'Strong Traffic Growth',
        description: `You've received ${analytics.totalPageViews} page views, showing healthy engagement.`,
        impact: 'medium',
        actionable: false
      });
    }

    recommendations.push(
      'Optimize page load times to reduce bounce rate',
      'Improve content quality and relevance',
      'Add clear call-to-action buttons',
      'Consider A/B testing different layouts'
    );
  }

  return { insights, recommendations };
}

async function mockSEOOptimization(params: any) {
  const { content, title, targetKeyword, metaDescription } = params;

  return {
    suggestions: [
      `Increase usage of primary keyword "${targetKeyword}" in the content`,
      'Add more H2 and H3 headings for better structure',
      'Optimize meta description length (aim for 150-160 characters)',
      'Include related keywords naturally in the content'
    ],
    optimizedTitle: title ? `${title} | ${targetKeyword}` : `Complete Guide to ${targetKeyword}`,
    optimizedMetaDescription: metaDescription || `Learn everything about ${targetKeyword}. Comprehensive guide with expert insights and practical tips.`,
    keywordRecommendations: [
      `${targetKeyword} guide`,
      `${targetKeyword} tips`,
      `${targetKeyword} best practices`,
      `${targetKeyword} examples`
    ],
    score: Math.floor(Math.random() * 30) + 70
  };
}