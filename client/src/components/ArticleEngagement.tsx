import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, MessageCircle, Share2, Twitter, Facebook, Link2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  articleId: string;
  userId: string | null;
  parentId: string | null;
  content: string;
  authorName: string | null;
  authorEmail: string | null;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ArticleEngagementProps {
  articleId: string;
  articleTitle: string;
  articleUrl: string;
}

export default function ArticleEngagement({ articleId, articleTitle, articleUrl }: ArticleEngagementProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Like state
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);

  // Comment state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch likes and comments on mount
  useEffect(() => {
    fetchLikes();
    fetchComments();
  }, [articleId]);

  const fetchLikes = async () => {
    try {
      const response = await fetch(`/api/articles/${articleId}/likes`);
      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setLikeCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/articles/${articleId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
        setCommentCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleLike = async () => {
    setLiking(true);
    try {
      const response = await fetch(`/api/articles/${articleId}/like`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setLikeCount(data.count);
      }
    } catch (error) {
      console.error("Error liking article:", error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    } finally {
      setLiking(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated && (!guestName.trim() || !guestEmail.trim())) {
      toast({
        title: "Error",
        description: "Please provide your name and email",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
          authorName: isAuthenticated ? null : guestName,
          authorEmail: isAuthenticated ? null : guestEmail,
        }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setCommentCount(commentCount + 1);
        setNewComment("");
        setGuestName("");
        setGuestEmail("");
        toast({
          title: "Success",
          description: "Comment posted successfully",
        });
      } else {
        throw new Error("Failed to post comment");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(articleTitle);

    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${title}&body=${url}`;
        break;
      case "copy":
        try {
          await navigator.clipboard.writeText(window.location.href);
          toast({
            title: "Success",
            description: "Link copied to clipboard",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to copy link",
            variant: "destructive",
          });
        }
        return;
      default:
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      {/* Engagement Actions */}
      <div className="flex items-center gap-4 py-4 border-y">
        <Button
          variant={liked ? "default" : "outline"}
          size="sm"
          onClick={handleLike}
          disabled={liking}
          className="flex items-center gap-2"
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
          <span>{likeCount}</span>
          <span className="hidden sm:inline">{liked ? "Liked" : "Like"}</span>
        </Button>

        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          <span>{commentCount}</span>
          <span className="hidden sm:inline">Comments</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleShare("twitter")}>
              <Twitter className="h-4 w-4 mr-2" />
              Share on Twitter
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare("facebook")}>
              <Facebook className="h-4 w-4 mr-2" />
              Share on Facebook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare("linkedin")}>
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              Share on LinkedIn
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare("email")}>
              <Mail className="h-4 w-4 mr-2" />
              Share via Email
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare("copy")}>
              <Link2 className="h-4 w-4 mr-2" />
              Copy Link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle>Comments ({commentCount})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            {!isAuthenticated && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guestName">Name *</Label>
                  <Input
                    id="guestName"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestEmail">Email *</Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="comment">Your Comment</Label>
              <Textarea
                id="comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                className="resize-none"
              />
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? "Posting..." : "Post Comment"}
            </Button>
          </form>

          <Separator />

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {(comment.authorName || user?.name || "U")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {comment.authorName || user?.name || "Anonymous"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
