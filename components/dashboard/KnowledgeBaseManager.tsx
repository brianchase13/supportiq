'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Search, 
  Plus, 
  FileText, 
  TrendingUp, 
  Loader2,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  BarChart3
} from 'lucide-react';

interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  usage_count: number;
  success_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface KnowledgeBaseManagerProps {
  userId: string;
}

export function KnowledgeBaseManager({ userId }: KnowledgeBaseManagerProps) {
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  });

  useEffect(() => {
    fetchKnowledgeBase();
  }, []);

  const fetchKnowledgeBase = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/knowledge-base/generate');
      if (response.ok) {
        const data = await response.json();
        setArticles(data.knowledgeBase || []);
      }
    } catch (error) {
      console.error('Failed to fetch knowledge base:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateFAQs = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/knowledge-base/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          daysBack: 30,
          minTicketCount: 3,
          maxFAQs: 10
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await fetchKnowledgeBase(); // Refresh the list
        alert(`Generated ${data.count} new FAQ articles!`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to generate FAQs');
      }
    } catch (error) {
      console.error('FAQ generation error:', error);
      alert('Failed to generate FAQs');
    } finally {
      setGenerating(false);
    }
  };

  const createArticle = async () => {
    if (!newArticle.title || !newArticle.content) return;

    try {
      const response = await fetch('/api/knowledge-base', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newArticle.title,
          content: newArticle.content,
          category: newArticle.category || 'general',
          tags: newArticle.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        }),
      });

      if (response.ok) {
        setNewArticle({ title: '', content: '', category: '', tags: '' });
        setIsCreating(false);
        await fetchKnowledgeBase();
      }
    } catch (error) {
      console.error('Failed to create article:', error);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(articles.map(a => a.category)));
  const totalUsage = articles.reduce((sum, a) => sum + a.usage_count, 0);
  const avgSuccessRate = articles.length > 0 
    ? articles.reduce((sum, a) => sum + (a.success_rate || 0), 0) / articles.length 
    : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading knowledge base...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Knowledge Base</h2>
          <p className="text-gray-600">Manage your AI-powered FAQ articles and knowledge</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={generateFAQs}
            disabled={generating}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Generate FAQs
          </Button>
          <Button onClick={() => setIsCreating(!isCreating)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Article
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{articles.length}</div>
                <div className="text-sm text-gray-600">Articles</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{totalUsage}</div>
                <div className="text-sm text-gray-600">Total Usage</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{Math.round(avgSuccessRate * 100)}%</div>
                <div className="text-sm text-gray-600">Avg Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Article Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Article</CardTitle>
            <CardDescription>
              Add a new FAQ article to your knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Article title (e.g., How do I reset my password?)"
              value={newArticle.title}
              onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
            />
            <Input
              placeholder="Category (e.g., authentication, billing, technical)"
              value={newArticle.category}
              onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
            />
            <Input
              placeholder="Tags (comma-separated, e.g., password, reset, login)"
              value={newArticle.tags}
              onChange={(e) => setNewArticle({ ...newArticle, tags: e.target.value })}
            />
            <Textarea
              placeholder="Article content - provide a detailed answer..."
              rows={6}
              value={newArticle.content}
              onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
            />
            <div className="flex space-x-2">
              <Button onClick={createArticle}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Create Article
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      <div className="space-y-4">
        {filteredArticles.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Articles Yet</h3>
              <p className="text-gray-600 mb-4">
                {articles.length === 0 
                  ? "Get started by generating FAQs from your support tickets or creating articles manually."
                  : "No articles match your search criteria."
                }
              </p>
              {articles.length === 0 && (
                <Button onClick={generateFAQs} disabled={generating}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Your First FAQs
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredArticles.map(article => (
            <Card key={article.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{article.title}</h3>
                      <Badge variant="secondary">{article.category}</Badge>
                      {article.success_rate && article.success_rate > 0.8 && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          High Success
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {article.content.substring(0, 200)}...
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Used {article.usage_count} times</span>
                      {article.success_rate && (
                        <span>{Math.round(article.success_rate * 100)}% success rate</span>
                      )}
                      <div className="flex space-x-1">
                        {article.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {article.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{article.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}