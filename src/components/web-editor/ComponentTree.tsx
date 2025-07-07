import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Code, Type, Image, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ParsedComponent {
  id: string;
  tagName: string;
  textContent: string;
  attributes: Record<string, string>;
  children: ParsedComponent[];
  depth: number;
}

interface ComponentTreeProps {
  components: ParsedComponent[];
  onSelectComponent: (component: ParsedComponent) => void;
  selectedComponent: ParsedComponent | null;
}

interface TreeNodeProps {
  component: ParsedComponent;
  onSelect: (component: ParsedComponent) => void;
  isSelected: boolean;
  depth: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ component, onSelect, isSelected, depth }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand first 2 levels

  const hasChildren = component.children.length > 0;
  const paddingLeft = depth * 16;

  const getElementIcon = (tagName: string) => {
    switch (tagName.toLowerCase()) {
      case 'img':
        return <Image className="w-3 h-3 text-purple-500" />;
      case 'a':
        return <LinkIcon className="w-3 h-3 text-blue-500" />;
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return <Type className="w-3 h-3 text-green-500" />;
      default:
        return <Code className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getElementColor = (tagName: string) => {
    switch (tagName.toLowerCase()) {
      case 'div':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'section':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'article':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'header':
      case 'footer':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'nav':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const truncatedText = component.textContent.length > 30 
    ? component.textContent.substring(0, 30) + '...' 
    : component.textContent;

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-1 p-1 rounded cursor-pointer hover:bg-muted/50 transition-colors ${
          isSelected ? 'bg-primary/10 border border-primary/20' : ''
        }`}
        style={{ paddingLeft }}
        onClick={() => onSelect(component)}
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="w-4 h-4 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </Button>
        )}
        
        {!hasChildren && <div className="w-4" />}
        
        {getElementIcon(component.tagName)}
        
        <Badge variant="secondary" className={`text-xs ${getElementColor(component.tagName)}`}>
          {component.tagName}
        </Badge>
        
        {component.attributes.id && (
          <Badge variant="outline" className="text-xs">
            #{component.attributes.id}
          </Badge>
        )}
        
        {component.attributes.class && (
          <Badge variant="outline" className="text-xs">
            .{component.attributes.class.split(' ')[0]}
          </Badge>
        )}
        
        {truncatedText && (
          <span className="text-xs text-muted-foreground ml-1 truncate">
            "{truncatedText}"
          </span>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <div>
          {component.children.map((child, index) => (
            <TreeNode
              key={`${child.id}-${index}`}
              component={child}
              onSelect={onSelect}
              isSelected={false} // This will be handled by parent component
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeNodeWithSelection: React.FC<{
  component: ParsedComponent;
  onSelect: (component: ParsedComponent) => void;
  selectedComponent: ParsedComponent | null;
  depth: number;
}> = ({ component, onSelect, selectedComponent, depth }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const hasChildren = component.children.length > 0;
  const paddingLeft = depth * 16;

  const getElementIcon = (tagName: string) => {
    switch (tagName.toLowerCase()) {
      case 'img':
        return <Image className="w-3 h-3 text-purple-500" />;
      case 'a':
        return <LinkIcon className="w-3 h-3 text-blue-500" />;
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return <Type className="w-3 h-3 text-green-500" />;
      default:
        return <Code className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getElementColor = (tagName: string) => {
    switch (tagName.toLowerCase()) {
      case 'div':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'section':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'article':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'header':
      case 'footer':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'nav':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const isSelected = selectedComponent?.id === component.id;
  const truncatedText = component.textContent.length > 30 
    ? component.textContent.substring(0, 30) + '...' 
    : component.textContent;

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-1 p-1 rounded cursor-pointer hover:bg-muted/50 transition-colors ${
          isSelected ? 'bg-primary/10 border border-primary/20' : ''
        }`}
        style={{ paddingLeft }}
        onClick={() => onSelect(component)}
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="w-4 h-4 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </Button>
        )}
        
        {!hasChildren && <div className="w-4" />}
        
        {getElementIcon(component.tagName)}
        
        <Badge variant="secondary" className={`text-xs ${getElementColor(component.tagName)}`}>
          {component.tagName}
        </Badge>
        
        {component.attributes.id && (
          <Badge variant="outline" className="text-xs">
            #{component.attributes.id}
          </Badge>
        )}
        
        {component.attributes.class && (
          <Badge variant="outline" className="text-xs">
            .{component.attributes.class.split(' ')[0]}
          </Badge>
        )}
        
        {truncatedText && (
          <span className="text-xs text-muted-foreground ml-1 truncate">
            "{truncatedText}"
          </span>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <div>
          {component.children.map((child, index) => (
            <TreeNodeWithSelection
              key={`${child.id}-${index}`}
              component={child}
              onSelect={onSelect}
              selectedComponent={selectedComponent}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ComponentTree: React.FC<ComponentTreeProps> = ({ 
  components, 
  onSelectComponent, 
  selectedComponent 
}) => {
  if (components.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No components found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] w-full">
      <div className="space-y-1">
        {components.map((component, index) => (
          <TreeNodeWithSelection
            key={`${component.id}-${index}`}
            component={component}
            onSelect={onSelectComponent}
            selectedComponent={selectedComponent}
            depth={0}
          />
        ))}
      </div>
    </ScrollArea>
  );
};