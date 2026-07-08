import tag from 'html-tag-js';
import { Card } from './Card.js';

export function ToolCard({ tool, isFavorite, onFavorite, onLaunch }) {
  return Card({
    icon: tool.icon,
    title: tool.title,
    description: tool.description,
    category: tool.category,
    favorite: isFavorite || false,
    onFavorite,
    onLaunch,
  });
}
