import React, { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Search } from 'lucide-react';
import { blogPosts } from '../data/blog-content';

type BlogPost = typeof blogPosts[0];

const BlogPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Get unique categories
  const categories = [...new Set(blogPosts.map(post => post.category))];

  // Filter posts based on search query and active tab
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeTab === 'all' || post.category === activeTab;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">ATS Insights for South African Job Seekers</h1>
          <p className="text-xl text-gray-600">
            Expert advice to help you navigate the South African job market and optimize your CV for ATS systems.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search articles..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className="md:w-auto w-full"
              onClick={() => setSearchQuery('')}
            >
              Clear
            </Button>
          </div>

          <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              <TabsTrigger value="all">All</TabsTrigger>
              {categories.map(category => (
                <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Blog Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
              <Button onClick={() => { setSearchQuery(''); setActiveTab('all'); }}>
                Reset Filters
              </Button>
            </div>
          )}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-24 max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 border border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Stay Updated with ATS Trends</h2>
            <p className="text-gray-600">
              Get the latest job market insights and ATS optimization strategies delivered to your inbox.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <Input 
              placeholder="Enter your email" 
              className="md:flex-grow"
              type="email"
            />
            <Button className="bg-amber-500 hover:bg-amber-600">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BlogCard = ({ post }: { post: BlogPost }) => {
  return (
    <Card className="h-full flex flex-col">
      <div className="h-48 overflow-hidden">
        <img 
          src={post.imageUrl} 
          alt={post.title} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-amber-600 font-medium">{post.category}</span>
          <span className="text-sm text-gray-500">{post.date}</span>
        </div>
        <CardTitle className="line-clamp-2 hover:text-amber-600">
          <Link href={`/blog/${post.slug}`}>
            {post.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-gray-600 line-clamp-3">
          {post.excerpt}
        </p>
      </CardContent>
      <CardFooter>
        <Link href={`/blog/${post.slug}`} className="text-amber-600 hover:text-amber-700 flex items-center">
          Read More
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  );
};

export default BlogPage;