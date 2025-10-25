# Article Engagement Features

This document describes the like, comment, and share features added to blog articles.

## Features

### 1. **Like System**
- Users can like articles (authenticated or anonymous)
- Anonymous likes are tracked by IP address
- Real-time like count updates
- Toggle functionality (like/unlike)
- Visual feedback with filled heart icon when liked

### 2. **Comments System**
- Nested comment support (with parent_id for replies)
- Authenticated users can comment with their profile
- Guest users can comment by providing name and email
- Moderation support (is_approved flag)
- Real-time comment count
- Time-ago formatting for comment timestamps
- Auto-approval for new comments (can be changed to manual approval)

### 3. **Share Options**
- **Twitter**: Share with pre-filled tweet
- **Facebook**: Share via Facebook dialog
- **LinkedIn**: Share to LinkedIn feed
- **Email**: Open email client with article link
- **Copy Link**: Copy article URL to clipboard

## Database Schema

### Likes Table
```sql
CREATE TABLE likes (
  id VARCHAR(36) PRIMARY KEY,
  article_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36), -- Nullable for anonymous likes
  ip_address VARCHAR(45), -- For anonymous tracking
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (article_id) REFERENCES articles(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Comments Table
```sql
CREATE TABLE comments (
  id VARCHAR(36) PRIMARY KEY,
  article_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36), -- Nullable for guest comments
  parent_id VARCHAR(36), -- For nested replies
  content TEXT NOT NULL,
  author_name VARCHAR(255), -- For guest comments
  author_email VARCHAR(255), -- For guest comments
  is_approved BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (article_id) REFERENCES articles(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (parent_id) REFERENCES comments(id)
);
```

## API Endpoints

### Likes
- `POST /api/articles/:id/like` - Toggle like for an article
- `GET /api/articles/:id/likes` - Get like count and user's like status

### Comments
- `POST /api/articles/:id/comments` - Create a new comment
- `GET /api/articles/:id/comments` - Get all comments for an article
- `PUT /api/comments/:id` - Update a comment (authenticated only)
- `DELETE /api/comments/:id` - Delete a comment (authenticated only)

## Usage

The engagement features are automatically displayed on all article pages via the `ArticleEngagement` component.

### Example
```tsx
import ArticleEngagement from "@/components/ArticleEngagement";

<ArticleEngagement
  articleId={article.id}
  articleTitle={article.title}
  articleUrl={window.location.href}
/>
```

## Component Props

### ArticleEngagement
- `articleId: string` - The unique ID of the article
- `articleTitle: string` - The article title (for share functionality)
- `articleUrl: string` - The full URL of the article

## Security Considerations

1. **Anonymous Likes**: Tracked by IP address to prevent duplicate likes
2. **Guest Comments**: Require name and email validation
3. **Comment Moderation**: `is_approved` flag allows manual approval
4. **XSS Protection**: All user input is sanitized and escaped
5. **Rate Limiting**: Consider adding rate limiting for likes and comments

## Future Enhancements

- [ ] Nested comment replies UI
- [ ] Comment editing with edit history
- [ ] Like reactions (multiple reaction types)
- [ ] Comment notifications
- [ ] Admin moderation dashboard
- [ ] Spam detection for comments
- [ ] Social login for easier commenting
- [ ] Comment sorting (newest, oldest, most liked)
- [ ] Comment pagination for popular articles

## Migration

Run the migration to create the new tables:

```bash
# Using the provided SQL migration
mysql -u your_user -p your_database < migrations/0002_add_likes_comments.sql
```

Or use Drizzle Kit:

```bash
npm run db:push
```
