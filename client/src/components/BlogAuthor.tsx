import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock } from "lucide-react";

interface BlogAuthorProps {
  name: string;
  title?: string;
  date: string;
  readTime?: string;
  avatarUrl?: string;
}

export default function BlogAuthor({ 
  name, 
  title, 
  date, 
  readTime,
  avatarUrl 
}: BlogAuthorProps) {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <div className="flex items-center space-x-4">
      <Avatar>
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={name} />
        ) : null}
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      
      <div>
        <div className="font-medium">{name}</div>
        {title && <div className="text-sm text-muted-foreground">{title}</div>}
        <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-3">
          <div className="flex items-center">
            <Calendar className="mr-1 h-3 w-3" />
            <span>{date}</span>
          </div>
          
          {readTime && (
            <div className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              <span>{readTime}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}